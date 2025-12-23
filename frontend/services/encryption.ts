import forge from 'node-forge';
import { authService } from './auth';

const KEY_SIZE = 2048;
const STORAGE_PREFIX = 'edulab_enc_';

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

export const encryptionService = {
    // Générer une paire de clés RSA
    generateKeyPair: async (): Promise<KeyPair> => {
        return new Promise((resolve, reject) => {
            forge.pki.rsa.generateKeyPair({ bits: KEY_SIZE, workers: 2 }, (err, keypair) => {
                if (err) {
                    reject(err);
                    return;
                }
                const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
                const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
                resolve({ publicKey: publicKeyPem, privateKey: privateKeyPem });
            });
        });
    },

    // Sauvegarder les clés localement
    saveKeysLocally: (keys: KeyPair) => {
        localStorage.setItem(`${STORAGE_PREFIX}pub`, keys.publicKey);
        localStorage.setItem(`${STORAGE_PREFIX}priv`, keys.privateKey);
    },

    // Récupérer les clés locales
    getLocalKeys: (): KeyPair | null => {
        const pub = localStorage.getItem(`${STORAGE_PREFIX}pub`);
        const priv = localStorage.getItem(`${STORAGE_PREFIX}priv`);
        if (pub && priv) {
            return { publicKey: pub, privateKey: priv };
        }
        return null;
    },

    // Initialiser le chiffrement (Utiliser les clés du backend ou générer si nécessaire)
    initializeEncryption: async (): Promise<KeyPair> => {
        // 1. Vérifier si on a des clés en localStorage
        let keys = encryptionService.getLocalKeys();

        if (keys) {
            return keys;
        }

        // 2. Récupérer l'utilisateur pour voir s'il a des clés sur le backend
        try {
            const user = await authService.getCurrentUser() as any;

            if (user.profile?.public_key && user.profile?.encrypted_private_key) {
                // Utiliser les clés du backend
                keys = {
                    publicKey: user.profile.public_key,
                    privateKey: user.profile.encrypted_private_key
                };

                // Les sauvegarder localement pour les prochaines fois
                encryptionService.saveKeysLocally(keys);
                console.log('Clés de chiffrement récupérées du backend');
                return keys;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des clés du backend', error);
        }

        // 3. Si pas de clés du tout, générer localement (fallback)
        console.warn('Génération de clés côté client (fallback)');
        keys = await encryptionService.generateKeyPair();
        encryptionService.saveKeysLocally(keys);

        // Uploader la clé publique au serveur
        try {
            await authService.updateProfile({
                public_key: keys.publicKey,
                encrypted_private_key: keys.privateKey
            });
            console.log('Clés générées et envoyées au backend');
        } catch (error) {
            console.error('Erreur lors de l\'envoi des clés au backend', error);
        }

        return keys;
    },

    // Générer une clé AES aléatoire (pour le message)
    generateAESKey: (): string => {
        return forge.util.bytesToHex(forge.random.getBytesSync(32)); // 256 bits
    },

    // Chiffrer le contenu avec AES
    encryptContent: (content: string, aesKeyHex: string): string => {
        const key = forge.util.hexToBytes(aesKeyHex);
        const iv = forge.random.getBytesSync(16);
        const cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(content, 'utf8'));
        cipher.finish();
        const encrypted = cipher.output;
        // Return IV + EncryptedContent encoded in Hex
        return forge.util.bytesToHex(iv + encrypted.data);
    },

    // Déchiffrer le contenu avec AES
    decryptContent: (encryptedHex: string, aesKeyHex: string): string => {
        try {
            const encryptedBytes = forge.util.hexToBytes(encryptedHex);
            const iv = encryptedBytes.substring(0, 16);
            const data = encryptedBytes.substring(16);

            const key = forge.util.hexToBytes(aesKeyHex);
            const decipher = forge.cipher.createDecipher('AES-CBC', key);
            decipher.start({ iv: iv });
            decipher.update(forge.util.createBuffer(data));
            const result = decipher.finish();

            if (result) {
                return decipher.output.toString();
            }
            return '';
        } catch (e) {
            console.error('Decryption error', e);
            return '';
        }
    },

    // Chiffrer la clé AES avec la clé publique RSA du destinataire
    encryptAESKey: (aesKeyHex: string, publicKeyPem: string): string => {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const encrypted = publicKey.encrypt(aesKeyHex, 'RSA-OAEP');
        return forge.util.bytesToHex(encrypted);
    },

    // Déchiffrer la clé AES avec ma clé privée RSA
    decryptAESKey: (encryptedAESKeyHex: string, privateKeyPem: string): string => {
        try {
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
            const encryptedBytes = forge.util.hexToBytes(encryptedAESKeyHex);
            const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
            return decrypted;
        } catch (e) {
            console.error('AES Key Decryption error', e);
            return '';
        }
    }
};

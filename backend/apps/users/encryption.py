# ============================================
# apps/users/encryption.py - Service de chiffrement
# ============================================
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
import logging

logger = logging.getLogger(__name__)


def generate_rsa_keypair():
    """
    Génère une paire de clés RSA 2048 bits.
    Retourne un tuple (public_key_pem, private_key_pem)
    """
    try:
        # Générer la clé privée
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        # Convertir la clé privée en PEM
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')
        
        # Extraire la clé publique et la convertir en PEM
        public_key = private_key.public_key()
        public_key_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
        
        return public_key_pem, private_key_pem
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération des clés RSA: {e}")
        return None, None


def ensure_user_has_keys(user_profile):
    """
    S'assure qu'un profil utilisateur a des clés de chiffrement.
    Si non, les génère et les sauvegarde.
    
    Args:
        user_profile: Instance de UserProfile
        
    Returns:
        bool: True si les clés existent ou ont été générées avec succès
    """
    if user_profile.public_key and user_profile.encrypted_private_key:
        return True
    
    try:
        public_key, private_key = generate_rsa_keypair()
        
        if public_key and private_key:
            user_profile.public_key = public_key
            # Note: En production, la clé privée devrait être chiffrée
            # avec le mot de passe de l'utilisateur ou un secret dérivé.
            # Pour l'instant, on la stocke en clair (le frontend la chiffre lui-même).
            user_profile.encrypted_private_key = private_key
            user_profile.save(update_fields=['public_key', 'encrypted_private_key'])
            
            logger.info(f"Clés générées pour le profil {user_profile.id}")
            return True
        
        return False
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération des clés pour profil {user_profile.id}: {e}")
        return False

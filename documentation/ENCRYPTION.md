# Système de Chiffrement End-to-End - EduConnect

## Vue d'ensemble

Le système de chiffrement garantit que tous les messages entre utilisateurs sont chiffrés de bout en bout (E2E) en utilisant RSA-2048 et AES-256.

## Architecture

### Backend (Django)

1. **Génération automatique des clés** (`apps/users/encryption.py`)
   - Génère une paire de clés RSA 2048 bits pour chaque utilisateur
   - Clé publique : stockée en clair (partagée avec les autres)
   - Clé privée : stockée (à chiffrer avec le mot de passe utilisateur en production)

2. **Signaux automatiques** (`apps/users/signals.py`)
   - `generate_encryption_keys_on_profile_create` : Génère les clés à la création du profil
   - `ensure_user_profile_has_keys` : Vérifie que chaque utilisateur a des clés
   - Définit automatiquement `is_current=True` sur les profils

3. **Serializers** (`apps/users/serializers.py`)
   - `UserProfileDetailSerializer` : Inclut `public_key` et `encrypted_private_key`
   - `UserRegistrationSerializer` : S'assure que `is_current=True` lors de l'inscription

### Frontend (React/TypeScript)

1. **Service de chiffrement** (`services/encryption.ts`)
   - Récupère les clés depuis le backend en priorité
   - Génère localement uniquement en fallback
   - Synchronise automatiquement avec le backend

2. **Initialisation automatique** (`context/AuthContext.tsx`)
   - Les clés sont initialisées dès la connexion
   - Pas besoin d'attendre l'ouverture du chat

3. **Chiffrement des messages** (`pages/Chat.tsx`)
   - Vérifie que tous les participants ont des clés publiques
   - Génère une clé AES unique par message
   - Chiffre le contenu avec AES
   - Chiffre la clé AES avec la clé publique RSA de chaque participant

## Commandes de maintenance

### Générer les clés pour tous les utilisateurs
```bash
python manage.py generate_encryption_keys
```

Options :
- `--force` : Régénère les clés même si elles existent

### Corriger les flags is_current
```bash
python manage.py fix_profile_flags
```

## Vérifications

### Vérifier que tous les profils ont des clés
```bash
python manage.py shell -c "
from apps.users.models import UserProfile
profiles = UserProfile.objects.filter(is_current=True)
print(f'Total: {profiles.count()}')
for p in profiles:
    has_keys = bool(p.public_key and p.encrypted_private_key)
    print(f'{p.user.email}: {\"✓\" if has_keys else \"✗\"} Clés')
"
```

### Vérifier is_current
```bash
python manage.py shell -c "
from apps.users.models import UserProfile
total = UserProfile.objects.count()
current = UserProfile.objects.filter(is_current=True).count()
print(f'Profils actifs: {current}/{total}')
"
```

## Flux de chiffrement

1. **Envoi d'un message**
   ```
   User A → Génère clé AES → Chiffre message avec AES
         → Chiffre clé AES avec public_key de User B
         → Envoie {contenu_chiffré, clés_chiffrées}
   ```

2. **Réception d'un message**
   ```
   User B → Reçoit message chiffré
         → Déchiffre la clé AES avec sa private_key
         → Déchiffre le contenu avec la clé AES
         → Affiche le message
   ```

## Sécurité

### Points forts
✅ Chiffrement RSA-2048 (clés asymétriques)
✅ Chiffrement AES-256-CBC (contenu des messages)
✅ Clé AES unique par message
✅ Génération automatique des clés
✅ Clés stockées côté serveur (backup)

### Améliorations futures
⚠️ Chiffrer la clé privée avec le mot de passe utilisateur
⚠️ Implémenter la rotation des clés
⚠️ Ajouter un système de récupération de clés
⚠️ Perfect Forward Secrecy (PFS)

## Dépannage

### "Message non chiffré (Destinataire sans clés)"

**Causes possibles :**
1. Le profil n'a pas `is_current=True`
   - Solution : `python manage.py fix_profile_flags`

2. Les clés n'ont pas été générées
   - Solution : `python manage.py generate_encryption_keys`

3. Les clés ne sont pas renvoyées par l'API
   - Vérifier que `UserProfileDetailSerializer` inclut les clés
   - Vérifier le mapping dans `services/messaging.ts`

### Logs de débogage

Dans la console du navigateur, lors de l'envoi d'un message :
```
🔐 Vérification du chiffrement:
  - Mes clés: Présentes
  - Autres participants: 1
  - Participant 1: [Nom]
    - public_key: Présente ✓
  - Chiffrement possible: OUI ✓
```

Si "NON ✗" apparaît, vérifier que le backend renvoie bien les clés.

## Développé par
Marino ATOHOUN pour Hypee - EduConnect Africa

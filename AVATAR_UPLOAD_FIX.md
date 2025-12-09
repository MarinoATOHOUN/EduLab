# Correction de l'Upload de Photo de Profil

## Problème
L'utilisateur ne pouvait pas changer sa photo de profil. Le système convertissait l'image en base64 mais la supprimait avant l'envoi au backend.

## Solution Implémentée

### Backend (Django)

1. **Nouvel endpoint d'upload** (`/api/auth/upload-avatar/`)
   - Fichier: `backend/apps/users/views.py`
   - Méthode: `POST`
   - Accepte: `multipart/form-data`
   - Validation:
     - Types de fichiers: JPEG, PNG, GIF, WebP
     - Taille maximale: 5MB
   - Fonctionnalités:
     - Génère un nom de fichier unique avec UUID
     - Sauvegarde dans `media/avatars/{user_id}/`
     - Désactive les anciens avatars
     - Crée un nouvel enregistrement `UserAvatar`
     - Retourne l'URL de l'avatar uploadé

2. **Configuration des fichiers media**
   - Dossier créé: `backend/media/avatars/`
   - URLs configurées pour servir les fichiers en développement
   - Settings déjà configurés:
     - `MEDIA_URL = 'media/'`
     - `MEDIA_ROOT = BASE_DIR / 'media'`

### Frontend (React + TypeScript)

1. **Service d'authentification** (`frontend/services/auth.ts`)
   - Nouvelle méthode: `uploadAvatar(file: File)`
   - Utilise `FormData` pour l'upload
   - Headers: `Content-Type: multipart/form-data`

2. **Composant EditProfileModal** (`frontend/components/EditProfileModal.tsx`)
   - Conversion base64 → File avant upload
   - Upload automatique lors de la sauvegarde
   - État de chargement (`isUploading`)
   - Indicateur visuel pendant l'upload
   - Gestion d'erreurs avec message utilisateur
   - Boutons désactivés pendant l'upload

## Flux d'Upload

1. **Utilisateur sélectionne une image**
   - Conversion en base64 pour prévisualisation
   - Stockage temporaire dans l'état local

2. **Utilisateur clique sur "Enregistrer"**
   - Conversion base64 → Blob → File
   - Upload via `authService.uploadAvatar(file)`
   - Réception de l'URL de l'avatar
   - Mise à jour du profil avec la nouvelle URL

3. **Backend traite l'upload**
   - Validation du fichier
   - Sauvegarde sur le disque
   - Création de l'enregistrement en DB
   - Retour de l'URL publique

## Améliorations UX

- ✅ Indicateur de chargement avec spinner
- ✅ Boutons désactivés pendant l'upload
- ✅ Messages d'erreur clairs
- ✅ Prévisualisation immédiate de l'image
- ✅ Validation côté client et serveur

## Test

Pour tester la fonctionnalité:

1. Se connecter à l'application
2. Cliquer sur l'avatar ou "Modifier le profil"
3. Cliquer sur "Changer la photo" ou sur l'avatar
4. Sélectionner une image (JPEG, PNG, GIF ou WebP, max 5MB)
5. Voir la prévisualisation
6. Cliquer sur "Enregistrer"
7. Observer l'indicateur de chargement
8. Vérifier que la photo est mise à jour

## Fichiers Modifiés

### Backend
- `backend/apps/users/views.py` - Ajout de l'endpoint upload_avatar
- `backend/media/avatars/` - Nouveau dossier créé

### Frontend
- `frontend/services/auth.ts` - Ajout de uploadAvatar()
- `frontend/components/EditProfileModal.tsx` - Logique d'upload et UX

## Notes Techniques

- Les fichiers sont stockés localement dans `media/avatars/{user_id}/`
- Pour la production, il faudra configurer un stockage cloud (S3, etc.)
- Les anciens avatars sont désactivés mais pas supprimés (historique)
- L'URL de l'avatar est servie via Django en développement

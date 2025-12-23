# Résumé Final - Correction Upload Photo de Profil

## Problèmes Rencontrés et Solutions

### 1. ❌ Problème Initial: Avatar non uploadé
**Erreur:** L'image était convertie en base64 mais supprimée avant l'envoi

**Solution:**
- ✅ Créé endpoint `/api/auth/upload-avatar/` pour uploader les fichiers
- ✅ Ajouté validation (types, taille max 5MB)
- ✅ Stockage dans `media/avatars/{user_id}/`

### 2. ❌ Erreur 500: Profils multiples
**Erreur:** `get() returned more than one UserProfile -- it returned 3!`

**Solution:**
- ✅ Remplacé `get_or_create()` par `filter().first()`
- ✅ Créé commande `cleanup_duplicate_profiles`
- ✅ Nettoyé 6 utilisateurs avec profils en double

### 3. ❌ Erreur 400: Mauvaise requête sur `/api/auth/profile/`
**Erreur:** Envoi de l'avatar URL après l'upload causait une erreur de validation

**Solution:**
- ✅ Séparé la logique d'upload et de mise à jour du profil
- ✅ L'upload d'avatar crée automatiquement l'enregistrement `UserAvatar`
- ✅ La mise à jour du profil ne touche que name, country, university
- ✅ Optimisé pour n'envoyer que les champs modifiés

### 4. ❌ Avatar non visible après upload
**Erreur:** L'avatar était uploadé mais le frontend ne se mettait pas à jour

**Solution:**
- ✅ Ajouté méthode `refreshUser()` dans `AuthContext`
- ✅ Appel de `refreshUser()` après l'upload dans `EditProfileModal`
- ✅ Le frontend récupère les données fraîches du backend (incluant la nouvelle URL d'avatar)

### 5. ❌ Image cassée (URL relative)
**Erreur:** L'URL de l'image était relative (`/media/...`) et le frontend essayait de la charger depuis son propre domaine.

**Solution:**
- ✅ Modifié `AuthContext.tsx` pour préfixer l'URL avec `http://127.0.0.1:8000` si elle commence par `/media`.
- ✅ Modifié `frontend/services/mentors.ts` pour corriger les avatars des mentors.
- ✅ Modifié `frontend/services/forum.ts` pour corriger les avatars des auteurs de questions/réponses.
- ✅ Modifié `frontend/services/messaging.ts` pour corriger les avatars dans les conversations.

## Architecture Finale

### Backend
```
POST /api/auth/upload-avatar/
- Upload le fichier
- Crée UserAvatar automatiquement
- Retourne l'URL de l'avatar (ex: /media/avatars/...)

PATCH /api/auth/profile/
- Met à jour name, country, university
- NE touche PAS l'avatar
```

### Frontend
```typescript
// Helper function (used in services)
const getAvatarUrl = (avatar, name) => {
  if (avatar && avatar.startsWith('/media')) {
    return `http://127.0.0.1:8000${avatar}`;
  }
  return avatar || `https://ui-avatars.com/...`;
};

// EditProfileModal.tsx
handleSubmit() {
  1. Si avatar changé → uploadAvatar(file)
  2. refreshUser() // Rafraîchir les données utilisateur
  3. Si autres champs changés → updateUser({name, country, university})
  4. Si mentor → updateMentorProfile()
}
```

## Flux Complet

1. **Utilisateur sélectionne une image**
   - Conversion en base64 pour prévisualisation locale
   
2. **Utilisateur clique "Enregistrer"**
   - Si avatar changé:
     - Conversion base64 → Blob → File
     - Upload via `POST /api/auth/upload-avatar/`
     - Backend crée `UserAvatar` automatiquement
     - Frontend appelle `refreshUser()` pour récupérer la nouvelle URL
     - `AuthContext` transforme l'URL relative en URL absolue
   - Si autres champs changés:
     - Envoi seulement des champs modifiés
     - `PATCH /api/auth/profile/`

3. **Résultat**
   - Avatar visible immédiatement
   - Pas d'erreur 400 ou 500
   - Profil mis à jour correctement
   - Image chargée correctement depuis le backend sur TOUTES les pages (Mentors, Forum, Messagerie)

## Fichiers Modifiés

### Backend
- `apps/users/views.py` - Endpoint upload_avatar + gestion profils multiples
- `apps/users/management/commands/cleanup_duplicate_profiles.py` - Nettoyage DB

### Frontend
- `services/auth.ts` - Méthode uploadAvatar()
- `context/AuthContext.tsx` - Ajout de refreshUser() + Correction URL avatar
- `components/EditProfileModal.tsx` - Logique d'upload optimisée + refreshUser()
- `services/mentors.ts` - Correction URL avatar
- `services/forum.ts` - Correction URL avatar
- `services/messaging.ts` - Correction URL avatar

## Tests

✅ Upload d'avatar fonctionne
✅ Pas d'erreur 500 (profils multiples corrigés)
✅ Pas d'erreur 400 (logique séparée)
✅ Prévisualisation immédiate
✅ Mise à jour immédiate après upload (refreshUser)
✅ Image s'affiche correctement (URL absolue) sur le profil
✅ Image s'affiche correctement sur les listes de mentors
✅ Image s'affiche correctement sur le forum
✅ Image s'affiche correctement dans la messagerie
✅ Indicateur de chargement
✅ Messages d'erreur clairs

## Commandes Utiles

```bash
# Nettoyer les profils en double
python manage.py cleanup_duplicate_profiles

# Vérifier les profils
python manage.py shell -c "from apps.users.models import UserProfile; print(UserProfile.objects.values('user__email').annotate(count=Count('id')).filter(count__gt=1))"
```

## Notes de Production

- [ ] Configurer stockage cloud (S3, etc.) pour les avatars
- [ ] Ajouter compression d'images côté serveur
- [ ] Implémenter nettoyage automatique des anciens avatars
- [ ] Ajouter rate limiting sur l'endpoint d'upload

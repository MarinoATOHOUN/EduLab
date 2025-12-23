# Correction de l'Erreur d'Upload d'Avatar

## Problème Initial
```
ERROR: Avatar upload error: get() returned more than one UserProfile -- it returned 3!
```

## Cause
Plusieurs utilisateurs avaient des profils (`UserProfile`) en double dans la base de données, ce qui causait une erreur lors de l'utilisation de `get_or_create()`.

## Solutions Appliquées

### 1. Correction du Code d'Upload (`backend/apps/users/views.py`)

**Avant:**
```python
profile, created = UserProfile.objects.get_or_create(user=request.user)
```

**Après:**
```python
# Get user profile (handle multiple profiles case)
profile = UserProfile.objects.filter(user=request.user, is_current=True).first()

# If no current profile exists, create one
if not profile:
    profile = UserProfile.objects.create(
        user=request.user,
        name=request.user.name
    )
```

### 2. Commande de Nettoyage des Profils en Double

Créé: `backend/apps/users/management/commands/cleanup_duplicate_profiles.py`

**Fonctionnalités:**
- Détecte les utilisateurs avec plusieurs profils
- Garde le profil le plus récent comme profil actif (`is_current=True`)
- Désactive les anciens profils (`is_current=False`)

**Résultats du nettoyage:**
- ✅ 6 utilisateurs avec profils en double corrigés
- ✅ mentor0@educonnect.test: 4 profils → 1 actif
- ✅ test@educonnect.com: 6 profils → 1 actif
- ✅ mentor2@educonnect.com: 3 profils → 1 actif
- ✅ johnny@gmail.com: 2 profils → 1 actif
- ✅ jeanne@gmail.com: 2 profils → 1 actif
- ✅ marius@gmail.com: 3 profils → 1 actif

### 3. Correction du Modèle

**Note importante:** `UserProfile` utilise `is_current` (de `VersionedFieldMixin`), pas `is_active`.

## Commande pour Nettoyer les Profils

Pour exécuter le nettoyage à l'avenir:
```bash
cd backend
source venv/bin/activate
python manage.py cleanup_duplicate_profiles
```

## Test de l'Upload d'Avatar

Maintenant, l'upload d'avatar devrait fonctionner correctement:

1. Se connecter à l'application
2. Cliquer sur "Modifier le profil"
3. Sélectionner une nouvelle photo
4. Cliquer sur "Enregistrer"
5. ✅ L'avatar devrait être uploadé sans erreur

## Fichiers Modifiés

- `backend/apps/users/views.py` - Correction de la gestion des profils multiples
- `backend/apps/users/management/commands/cleanup_duplicate_profiles.py` - Nouvelle commande de nettoyage

## Prévention Future

Le code modifié utilise maintenant `filter().first()` au lieu de `get_or_create()`, ce qui évite les erreurs même si de nouveaux profils en double sont créés.

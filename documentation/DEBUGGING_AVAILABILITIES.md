# 🔍 Guide de Débogage - Système de Disponibilités

## 📊 Logs Implémentés

### Frontend (Console du Navigateur)
Les logs frontend s'affichent dans la console du navigateur (F12 > Console).

**Flux de logs :**
```
🔵 [FRONTEND] Starting availability save process...
📊 [FRONTEND] Current state: { recurringSlots: [...], specificDates: [...] }
📤 [FRONTEND] Sending to backend: { availabilities: [...], totalSlots: X, ... }
✅ [FRONTEND] Backend response received: {...}
🎉 [FRONTEND] Save successful!
```

**En cas d'erreur :**
```
❌ [FRONTEND] Save failed: Error message
📋 [FRONTEND] Error details: { message: ..., response: ..., status: ... }
```

### Backend (Terminal Django)
Les logs backend s'affichent dans le terminal où Django tourne.

**Flux de logs :**
```
📖 [VIEW] GET my_profile for user: user@example.com
✏️ [VIEW] PATCH my_profile for user: user@example.com
📥 [VIEW] Request data: {...}
🔵 [BACKEND] Starting mentor profile update...
📊 [BACKEND] Received data: {...}
📅 [BACKEND] Processing X availability slots
📋 [BACKEND] Availabilities data: [...]
🗑️ [BACKEND] Deactivated X recurring and Y specific slots
➕ [BACKEND] Creating recurring slot: {...}
➕ [BACKEND] Creating specific date slot: {...}
✅ [BACKEND] Created X recurring and Y specific slots
🎉 [BACKEND] Mentor profile update completed successfully!
✅ [VIEW] Profile updated successfully
```

## 🧪 Comment Tester

### 1. Ouvrir la Console du Navigateur
- Appuyer sur `F12` ou `Ctrl+Shift+I`
- Aller dans l'onglet "Console"

### 2. Ouvrir le Terminal Django
- Vérifier que le serveur Django tourne
- Observer les logs en temps réel

### 3. Effectuer une Modification
1. Se connecter en tant que mentor
2. Aller sur le Dashboard Mentor
3. Cliquer sur "Gérer mes disponibilités"
4. Ajouter/Modifier des créneaux :
   - **Créneaux récurrents** : Lundi 09:00-17:00
   - **Dates spécifiques** : 15/12/2024 14:00-18:00
5. Cliquer sur "Enregistrer"

### 4. Analyser les Logs

#### ✅ Scénario de Succès
**Frontend :**
```javascript
🔵 [FRONTEND] Starting availability save process...
📊 [FRONTEND] Current state: {
  recurringSlots: [
    { day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00' }
  ],
  specificDates: [
    { date: '2024-12-15', start_time: '14:00', end_time: '18:00' }
  ]
}
📤 [FRONTEND] Sending to backend: {
  availabilities: [
    { day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00' },
    { specific_date: '2024-12-15', start_time: '14:00', end_time: '18:00' }
  ],
  totalSlots: 2,
  recurringCount: 1,
  specificCount: 1
}
✅ [FRONTEND] Backend response received: {...}
🎉 [FRONTEND] Save successful!
```

**Backend :**
```
✏️ [VIEW] PATCH my_profile for user: mentor@example.com
📥 [VIEW] Request data: {'availabilities': [...]}
🔵 [BACKEND] Starting mentor profile update...
📅 [BACKEND] Processing 2 availability slots
🗑️ [BACKEND] Deactivated 0 recurring and 0 specific slots
➕ [BACKEND] Creating recurring slot: {'day_of_week': 'MONDAY', 'start_time': '09:00', 'end_time': '17:00'}
➕ [BACKEND] Creating specific date slot: {'specific_date': '2024-12-15', 'start_time': '14:00', 'end_time': '18:00'}
✅ [BACKEND] Created 1 recurring and 1 specific slots
🎉 [BACKEND] Mentor profile update completed successfully!
```

#### ❌ Scénario d'Erreur
**Frontend :**
```javascript
❌ [FRONTEND] Validation failed
// OU
❌ [FRONTEND] Save failed: Error
📋 [FRONTEND] Error details: {
  message: "Network Error",
  response: { error: "..." },
  status: 400
}
```

## 🔎 Points de Vérification

### 1. Format des Données Frontend
Vérifier que le frontend envoie :
```javascript
{
  availabilities: [
    // Créneaux récurrents
    { day_of_week: 'MONDAY', start_time: '09:00', end_time: '17:00' },
    // Dates spécifiques
    { specific_date: '2024-12-15', start_time: '14:00', end_time: '18:00' }
  ]
}
```

### 2. Réception Backend
Vérifier que le backend reçoit bien les données :
```
📥 [VIEW] Request data: {'availabilities': [...]}
```

### 3. Traitement Backend
Vérifier que le backend traite correctement :
```
➕ [BACKEND] Creating recurring slot: {...}
➕ [BACKEND] Creating specific date slot: {...}
```

### 4. Vérification en Base de Données
```bash
# Se connecter à la base de données
python manage.py dbshell

# Vérifier les créneaux récurrents
SELECT * FROM mentor_availabilities WHERE is_active = true;

# Vérifier les dates spécifiques
SELECT * FROM mentor_specific_date_availabilities WHERE is_active = true;
```

## 🐛 Problèmes Courants

### Problème 1 : Aucun log backend
**Cause** : Le serveur Django ne tourne pas ou les logs ne sont pas configurés
**Solution** : Vérifier que `python manage.py runserver` est actif

### Problème 2 : Données non sauvegardées
**Cause** : Erreur de validation ou de format
**Solution** : Vérifier les logs pour voir où ça bloque :
- Validation frontend ?
- Erreur réseau ?
- Erreur backend ?

### Problème 3 : Type mismatch
**Cause** : Le frontend envoie un format différent de ce que le backend attend
**Solution** : Comparer les logs frontend (📤 Sending) et backend (📥 Request data)

## 📝 Checklist de Débogage

- [ ] Console navigateur ouverte (F12)
- [ ] Terminal Django visible
- [ ] Effectuer une modification de disponibilité
- [ ] Vérifier les logs frontend (🔵 → 📤 → ✅)
- [ ] Vérifier les logs backend (📥 → 🔵 → ➕ → ✅)
- [ ] Vérifier en base de données
- [ ] Rafraîchir la page et vérifier que les données persistent

## 🎯 Résultat Attendu

Après une sauvegarde réussie :
1. ✅ Logs frontend montrent "Save successful!"
2. ✅ Logs backend montrent "Profile updated successfully!"
3. ✅ Les créneaux apparaissent en base de données
4. ✅ En rafraîchissant, les créneaux sont toujours là
5. ✅ Le profil mentor affiche les nouvelles disponibilités

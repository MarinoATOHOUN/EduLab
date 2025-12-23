# 🎯 Guide de Test - Gestion des Profils

**Développé par Marino ATOHOUN pour Hypee**

---

## ✅ Fonctionnalités Implémentées

### 1. Profil Utilisateur (Étudiant & Mentor)
- Modification du nom
- Modification du pays
- Modification de l'université
- Modification de l'avatar (via URL pour l'instant)

### 2. Profil Mentor (Spécifique)
- Modification de la bio
- Gestion des spécialités (Tags)
- Gestion des disponibilités (Hebdomadaire)
- Gestion des réseaux sociaux (LinkedIn, Twitter, Website)

---

## 🚀 Scénario de Test Utilisateur

### **Étape 1 : Inscription Mentor**

1. S'inscrire comme **Mentor**
2. Vérifier que le compte est créé

### **Étape 2 : Modifier Profil de Base**

1. Cliquer sur l'avatar en haut à droite -> "Profil" (ou via Settings)
2. Modifier :
   - Nom : "Dr. Test"
   - Pays : "Sénégal"
   - Université : "UCAD"
3. Sauvegarder
4. ✅ Vérifier que les changements sont immédiats

### **Étape 3 : Modifier Profil Mentor**

1. Dans la même modale, descendre à la section "Informations Mentor"
2. Remplir :
   - Bio : "Expert en IA..."
   - Spécialités : Ajouter "Python", "Machine Learning"
   - Disponibilités : Ajouter "Lundi : 09:00 - 12:00"
   - Réseaux : Ajouter lien LinkedIn
3. Sauvegarder
4. ✅ Vérifier la notification de succès

---

## 🔍 Vérification Backend

### Création Automatique
Vérifier que `MentorProfile` est créé automatiquement lors de l'inscription d'un mentor.

### API Endpoints

#### Update Basic Profile
```bash
curl -X PATCH http://127.0.0.1:8000/api/auth/profile/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouveau Nom",
    "country": "Togo"
  }'
```

#### Update Mentor Profile
```bash
curl -X PATCH http://127.0.0.1:8000/api/mentors/my_profile/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Ma nouvelle bio",
    "specialties": ["Code", "Design"],
    "availabilities": [
        {"day_of_week": "MONDAY", "start_time": "10:00", "end_time": "12:00"}
    ],
    "socials": [
        {"platform": "TWITTER", "url": "https://twitter.com/test"}
    ]
  }'
```

---

## ⚠️ Limitations Connues

1. **Disponibilités par Date** : Le frontend permet de saisir une date spécifique, mais le backend ne supporte que les jours de la semaine.
   - **Solution actuelle** : Le frontend convertit la date en jour de la semaine (ex: 12/12/2025 -> VENDREDI).
   
2. **Avatar** : L'upload de fichier n'est pas encore connecté au backend (nécessite gestion fichiers statiques/S3). Seules les URLs sont supportées pour l'instant.

---

**✅ La gestion des profils est opérationnelle !**

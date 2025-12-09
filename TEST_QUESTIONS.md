# 🧪 Guide de Test - Création de Questions

**Développé par Marino ATOHOUN pour Hypee**

## ✅ Fonctionnalité Implémentée

La création de questions est maintenant **100% fonctionnelle** et connectée à l'API Django !

---

## 🚀 Comment Tester

### 1. **Vérifier que les serveurs tournent**

```bash
# Terminal 1 - Backend
cd backend
python3 manage.py runserver
# Serveur sur http://127.0.0.1:8000

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Serveur sur http://localhost:5173
```

### 2. **Créer un compte**

1. Ouvrir http://localhost:5173
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire :
   - Nom: Votre nom
   - Email: votre@email.com
   - Mot de passe: minimum 8 caractères
   - Rôle: Étudiant ou Mentor
4. Soumettre

### 3. **Se connecter**

Si vous avez déjà un compte :
1. Email: votre@email.com
2. Mot de passe: votre mot de passe
3. Connexion

### 4. **Créer une Question**

1. Aller sur l'onglet "Questions"
2. Cliquer sur le bouton **"Poser une question"** (en haut à droite)
3. Remplir le formulaire dans le modal :
   - **Titre** : "Comment intégrer React avec Django ?"
   - **Matière** : Informatique
   - **Niveau** : Licence
   - **Tags** : Taper "react" puis Espace, "django" puis Espace, "api" puis Espace
   - **Détails** : Expliquer votre problème en détail
4. Cliquer sur **"Publier"**
5. ✨ La question sera créée et la page rechargée automatiquement !

---

## 🎯 Résultats Attendus

### Pendant la Création
- ✅ Bouton "Publier" devient "Publication..." avec un spinner
- ✅ Tous les champs sont désactivés pendant l'envoi
- ✅ Si erreur : message d'erreur rouge s'affiche

### Après Création Réussie
- ✅ Popup "✅ Votre question a été publiée avec succès !"
- ✅ Modal se ferme automatiquement
- ✅ Page se recharge pour afficher la nouvelle question
- ✅ **+50 points** ajoutés à votre compte
- ✅ Badge "Premier Pas" débloqué (si première question)

### Dans la Base de Données
La question est stockée avec :
- ✅ Titre
- ✅ Contenu
- ✅ Tags
- ✅ Auteur (vous)
- ✅ Date de création
- ✅ Statut: Non résolu

---

## 🔍 Vérifier dans l'Admin Django

1. Ouvrir http://127.0.0.1:8000/admin/
2. Se connecter (superutilisateur créé avec `createsuperuser`)
3. Aller dans **Forum > Questions**
4. Voir votre question enregistrée !

---

## 📊 Test API Direct (Optionnel)

### Via cURL

```bash
# 1. Se connecter
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@educonnect.com","password":"Test123456"}'

# Copier le "access" token

# 2. Créer une question
curl -X POST http://127.0.0.1:8000/api/forum/questions/ \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Ma nouvelle question",
    "content":"Détails de ma question...",
    "tags":["test","api"]
  }'
```

### Réponse API Attendue

```json
{
  "id": 1,
  "author": {
    "id": 1,
    "email": "test@educonnect.com",
    "role": "STUDENT",
    "points": 50,
    "profile": {
      "name": "Test User",
      "avatar": null,
      "country": null,
      "university": null
    }
  },
  "title": "Ma nouvelle question",
  "content": "Détails de ma question...",
  "tags": ["test", "api"],
  "votes": 0,
  "is_solved": false,
  "views_count": 0,
  "answers_count": 0,
  "created_at": "2025-11-29T20:17:55..."
}
```

---

## ⚠️ Troubleshooting

### Problème : "Authentification requise"
**Solution** : Assurez-vous d'être connecté

### Problème : "Données invalides"
**Solution** : Vérifiez que tous les champs requis sont remplis

### Problème : "Erreur 500"
**Solution** : Vérifiez la console du terminal backend pour voir l'erreur exacte

### Problème : La question ne s'affiche pas
**Solution** : Actualisez la page manuellement (F5)

---

## 🎓 Prochains Tests Recommandés

1. ✅ Créer plusieurs questions
2. ✅ Filtrer par "Résolu/Non résolu"
3. ✅ Rechercher des questions
4. ✅ Voter pour une question (à implémenter)
5. ✅ Répondre à une question (à implémenter)

---

## 📝 Notes Importantes

- **Authentification obligatoire** : Il faut être connecté pour créer une question
- **Tags automatiques** : La catégorie et le niveau sont automatiquement ajoutés comme tags
- **Points** : Chaque question rapporte 50 points
- **Validation** : Titre, contenu et catégorie sont obligatoires

---

**✅ La fonctionnalité est prête pour la production !**

*Développé avec ❤️ par Marino ATOHOUN pour Hypee*

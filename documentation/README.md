# 🎓 EduConnect Africa - Plateforme d'Apprentissage Collaborative

> **Développé par Marino ATOHOUN pour Hypee**

Une plateforme moderne connectant étudiants et mentors à travers l'Afrique, avec des outils d'IA, gamification et opportunités académiques.

---

## 🏗️ Architecture

### Stack Technologique

**Frontend:**
- ⚛️ React 19 + TypeScript
- ⚡ Vite (build tool)
- 🎨 CSS personnalisé
- 🔄 React Router v7
- 📡 Axios pour les appels API

**Backend:**
- 🐍 Python 3.12 + Django 4.2
- 🔌 Django REST Framework
- 🔐 JWT Authentication (Simple JWT)
- 🔄 Django Channels (WebSockets)
- 📊 PostgreSQL / SQLite

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ (pour le frontend)
- Python 3.12+ (pour le backend)
- npm ou yarn

### Installation Backend

```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

Le backend sera accessible sur `http://127.0.0.1:8000`

### Installation Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

---

## 📁 Structure du Projet

```
educonnect/
├── backend/
│   ├── apps/
│   │   ├── users/          # Gestion utilisateurs
│   │   ├── mentors/        # Profils mentors
│   │   ├── bookings/       # Réservations sessions
│   │   ├── forum/          # Questions/Réponses
│   │   ├── gamification/   # Badges & Points
│   │   ├── messaging/      # Chat temps réel
│   │   ├── notifications/  # Système notifications
│   │   ├── opportunities/  # Bourses & Stages
│   │   ├── ai_tools/       # Tuteur IA
│   │   ├── core/           # Mixins réutilisables
│   │   └── analytics/      # Statistique
│   ├── educonnect/         # Configuration Django
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── pages/              # Pages React
│   ├── components/         # Composants réutilisables
│   ├── context/            # React Context (Auth, Theme, etc.)
│   ├── services/           # Services API (axios)
│   ├── types.ts            # Types TypeScript
│   ├── constants.ts        # Constantes
│   └── App.tsx             # Point d'entrée
│
├── INTEGRATION_LOG.md      # Journal d'intégration
├── test_api.sh             # Script de test API
└── README.md               # Ce fichier
```

---

## 🔌 APIs & Endpoints

### Documentation Interactive
- **Swagger UI:** http://127.0.0.1:8000/api/docs/
- **ReDoc:** http://127.0.0.1:8000/api/redoc/
- **Schema OpenAPI:** http://127.0.0.1:8000/api/schema/

### Endpoints Principaux

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `/api/auth/` | Authentification JWT |
| **Forum** | `/api/forum/` | Questions & Réponses |
| **Mentors** | `/api/mentors/` | Profils mentors |
| **Bookings** | `/api/bookings/` | Réservations |
| **Opportunities** | `/api/opportunities/` | Bourses & Stages |
| **Notifications** | `/api/notifications/` | Notifications |
| **Gamification** | `/api/gamification/` | Badges & Points |
| **AI** | `/api/ai/` | Tuteur IA |

Consultez `frontend/API_GUIDE.md` pour des exemples détaillés.

---

## ✨ Fonctionnalités

### 🔐 Authentification
- ✅ Inscription étudiant/mentor
- ✅ Connexion JWT
- ✅ Refresh automatique des tokens
- ✅ Gestion de profil

### 💬 Forum Académique
- ✅ Poser des questions
- ✅ Répondre aux questions
- ✅ Système de votes (upvote/downvote)
- ✅ Tags & catégories
- ✅ Recherche avancée
- ✅ Filtres (résolu/non résolu)

### 👨‍🏫 Mentorat
- ✅ Recherche de mentors
- ✅ Profils détaillés
- ✅ Système de notation & avis
- ✅ Réservation de sessions
- ✅ Calendrier de disponibilité

### 🎯 Opportunités
- ✅ Bourses d'études
- ✅ Stages & internships
- ✅ Concours académiques
- ✅ Formations

### 🏆 Gamification
- ✅ Système de points
- ✅ Badges de progression
- ✅ Classements
- ✅ Récompenses

### 🤖 Outils IA
- ✅ Tuteur pédagogique (Gemini/GPT)
- ✅ Sandbox de code
- ✅ Atlas interactif géographique
- ✅ Atelier d'écriture
- ✅ Calculatrice scientifique

### 💬 Messagerie
- ✅ Chat temps réel
- ✅ WebSockets (Django Channels)
- ✅ Conversations privées

### 🔔 Notifications
- ✅ Temps réel
- ✅ Notifications push
- ✅ Historique

---

## 🧪 Tests

### Test des endpoints backend

```bash
./test_api.sh
```

### Scénario de test complet

1. **Créer un compte**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "name": "John Doe",
    "role": "STUDENT"
  }'
```

2. **Se connecter**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

3. **Récupérer les questions (avec token)**
```bash
curl -X GET http://127.0.0.1:8000/api/forum/questions/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🛠️ Développement

### Variables d'environnement

Créez un fichier `.env` dans `backend/` :

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database (optionnel, SQLite par défaut)
DB_NAME=educonnect_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# APIs IA (optionnel)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Commandes utiles

```bash
# Backend
python manage.py makemigrations    # Créer migrations
python manage.py migrate           # Appliquer migrations
python manage.py createsuperuser   # Créer admin
python manage.py collectstatic     # Collecter fichiers statiques
python manage.py test              # Lancer les tests

# Frontend
npm run dev                        # Dev server
npm run build                      # Build production
npm run preview                    # Preview build
```

---

## 📚 Documentation Complète

- **[INTEGRATION_LOG.md](./INTEGRATION_LOG.md)** : Journal détaillé de l'intégration frontend/backend
- **[frontend/API_GUIDE.md](./frontend/API_GUIDE.md)** : Guide d'utilisation des services API
- **[backend/STRUCTURE_FILE.MD](./backend/STRUCTURE_FILE.MD)** : Structure des modèles backend
- **[backend/GUIDE_COMPLET.MD](./backend/GUIDE_COMPLET.MD)** : Guide complet backend

---

## 🤝 Contribution

Ce projet a été développé par **Marino ATOHOUN** pour **Hypee**.

### Workflow de contribution
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

© 2025 Hypee - Marino ATOHOUN. Tous droits réservés.

---

## 📞 Support

Pour toute question ou support :
- 📧 Email: contact@hypee.africa
- 🌐 Site: https://hypee.africa
- 📱 Discord: [Lien Discord]

---

**Fait avec ❤️ en Afrique pour l'Afrique** 🌍

# EduConnect Africa API

API REST Django pour la plateforme EduConnect Africa - Initiative Hypee (Bénin)

## 🚀 Technologies

- **Django 4.2** + **Django REST Framework 3.14**
- **PostgreSQL 15** (Base de données)
- **Redis** (Cache & Celery)
- **Channels** (WebSockets pour le chat)
- **JWT** (Authentification)
- **Celery** (Tâches asynchrones)
- **Docker** (Containerisation)

## 📋 Prérequis

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optionnel)

## ⚙️ Installation

### Méthode 1: Installation locale

1. **Cloner le projet**
```bash
git clone <repo-url>
cd educonnect-api
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\\Scripts\\activate  # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

5. **Créer la base de données**
```bash
createdb educonnect_db
```

6. **Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Initialiser les données**
```bash
python manage.py init_db
python manage.py create_test_data --users 20
```

8. **Créer un superuser**
```bash
python manage.py createsuperuser
```

9. **Lancer le serveur**
```bash
python manage.py runserver
```

### Méthode 2: Avec Docker

```bash
docker-compose up --build
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py init_db
docker-compose exec web python manage.py createsuperuser
```

## 📚 Documentation API

Une fois le serveur lancé:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Admin Django**: http://localhost:8000/admin/

## 🔑 Endpoints Principaux

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion
- `GET /api/auth/me/` - Profil actuel
- `PATCH /api/auth/update_profile/` - Mise à jour profil

### Mentors
- `GET /api/mentors/` - Liste des mentors
- `GET /api/mentors/{id}/` - Détail mentor
- `PATCH /api/mentors/my_profile/` - Mise à jour profil mentor

### Forum
- `GET /api/forum/questions/` - Liste questions
- `POST /api/forum/questions/` - Créer question
- `POST /api/forum/questions/{id}/vote/` - Voter
- `POST /api/forum/questions/{id}/answers/` - Répondre

### Réservations
- `POST /api/bookings/` - Créer réservation
- `GET /api/bookings/mentor_requests/` - Demandes reçues
- `PATCH /api/bookings/{id}/update_status/` - Accepter/Refuser

### Gamification
- `GET /api/gamification/leaderboard/` - Classement
- `GET /api/gamification/my_badges/` - Mes badges
- `GET /api/gamification/stats/` - Statistiques

### Messagerie
- `GET /api/messages/conversations/` - Conversations
- `POST /api/messages/conversations/{id}/send_message/` - Envoyer message
- WebSocket: `ws://localhost:8001/ws/chat/{conversation_id}/`

### Notifications
- `GET /api/notifications/` - Mes notifications
- `POST /api/notifications/mark_all_read/` - Tout marquer lu

### Opportunités
- `GET /api/opportunities/` - Liste opportunités

### IA
- `POST /api/ai/tutor/` - Tuteur IA

## 🧪 Tests

```bash
pytest
pytest --cov=apps
```

## 🏗️ Structure du Projet

```
educonnect-api/
├── apps/
│   ├── users/          # Authentification & Utilisateurs
│   ├── mentors/        # Gestion mentors
│   ├── bookings/       # Système de réservation
│   ├── forum/          # Questions & Réponses
│   ├── gamification/   # Points & Badges
│   ├── messaging/      # Chat en temps réel
│   ├── notifications/  # Notifications
│   ├── opportunities/  # Opportunités
│   ├── ai_tools/       # Tuteur IA
│   ├── analytics/      # Analytics
│   └── core/           # Mixins, utilities
├── educonnect_api/     # Configuration Django
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## 🔒 Sécurité

- Tokens JWT avec refresh
- Rate limiting
- CORS configuré
- Validation des entrées
- Soft delete pour traçabilité
- HTTPS obligatoire en production

## 📊 Monitoring

Intégration Sentry pour le monitoring des erreurs en production.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request

## 📝 Licence

Propriétaire - Initiative Hypee Bénin

## 👥 Équipe

Initiative Hypee - Bénin
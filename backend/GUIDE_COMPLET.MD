# 📘 GUIDE COMPLET - EduConnect Africa API

## 🎯 Vue d'Ensemble

API REST Django complète pour EduConnect Africa avec traçabilité maximale, soft delete, et versioning des données.

---

## 📁 Architecture du Projet

```
educonnect-api/
│
├── educonnect_api/              # Configuration Django
│   ├── __init__.py
│   ├── settings.py             # Configuration complète
│   ├── urls.py                 # Routes principales
│   ├── asgi.py                 # Configuration ASGI (WebSockets)
│   ├── wsgi.py                 # Configuration WSGI
│   └── celery.py               # Configuration Celery
│
├── apps/                        # Applications Django
│   │
│   ├── core/                   # Utilitaires & Base
│   │   ├── models.py          # Mixins (Timestamp, SoftDelete, Versioned)
│   │   ├── permissions.py     # Permissions personnalisées
│   │   ├── exceptions.py      # Gestionnaire d'exceptions
│   │   ├── middleware.py      # Middleware d'activité
│   │   └── management/
│   │       └── commands/
│   │           ├── init_db.py         # Initialisation DB
│   │           └── create_test_data.py # Données de test
│   │
│   ├── users/                  # Authentification & Utilisateurs
│   │   ├── models.py          # User, UserProfile, UserAvatar, etc.
│   │   ├── serializers.py     # User, Registration, Login, Update
│   │   ├── views.py           # AuthViewSet
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── mentors/                # Gestion Mentors
│   │   ├── models.py          # MentorProfile, Bio, Specialties, etc.
│   │   ├── serializers.py     # Mentor CRUD
│   │   ├── views.py           # MentorViewSet
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── bookings/               # Système de Réservation
│   │   ├── models.py          # Booking, Domains, Expectations, etc.
│   │   ├── serializers.py     # Booking CRUD
│   │   ├── views.py           # BookingViewSet
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── forum/                  # Questions & Réponses
│   │   ├── models.py          # Question, Answer (versionné)
│   │   ├── serializers.py     # Forum CRUD
│   │   ├── views.py           # QuestionViewSet, AnswerViewSet
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── gamification/           # Points & Badges
│   │   ├── models.py          # Badge, UserBadge, PointsHistory
│   │   ├── serializers.py     # Gamification
│   │   ├── views.py           # GamificationViewSet
│   │   ├── services.py        # BadgeService (logique métier)
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── messaging/              # Chat Temps Réel
│   │   ├── models.py          # Conversation, Message
│   │   ├── serializers.py     # Messaging
│   │   ├── views.py           # ConversationViewSet
│   │   ├── consumers.py       # WebSocket Consumer
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── notifications/          # Système de Notifications
│   │   ├── models.py          # Notification
│   │   ├── serializers.py     # Notification
│   │   ├── views.py           # NotificationViewSet
│   │   ├── services.py        # NotificationService
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── opportunities/          # Opportunités (Bourses, Stages)
│   │   ├── models.py          # Opportunity
│   │   ├── serializers.py     # Opportunity
│   │   ├── views.py           # OpportunityViewSet
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── ai_tools/               # Tuteur IA
│   │   ├── models.py          # AITutorSession, CodeSnippet
│   │   ├── serializers.py     # AI Request/Response
│   │   ├── views.py           # AIToolsViewSet
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   └── analytics/              # Analytics (Optionnel)
│       ├── models.py          # UserActivity, SystemMetric
│       └── views.py           # AnalyticsViewSet
│
├── logs/                       # Logs application
├── media/                      # Fichiers uploadés
├── staticfiles/                # Fichiers statiques collectés
├── templates/                  # Templates Django
│
├── requirements.txt            # Dépendances Python
├── pytest.ini                  # Configuration pytest
├── conftest.py                 # Fixtures pytest
├── .env.example                # Variables d'environnement
├── Dockerfile                  # Docker image
├── docker-compose.yml          # Docker services
├── deploy.sh                   # Script de déploiement
├── manage.py                   # CLI Django
└── README.md                   # Documentation
```

---

## 🚀 Installation & Démarrage

### Option 1: Installation Locale

```bash
# 1. Cloner le projet
git clone <repo-url>
cd educonnect-api

# 2. Environnement virtuel
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# 5. Base de données PostgreSQL
createdb educonnect_db

# 6. Migrations
python manage.py makemigrations
python manage.py migrate

# 7. Initialiser les données
python manage.py init_db

# 8. Créer un superuser
python manage.py createsuperuser

# 9. (Optionnel) Données de test
python manage.py create_test_data --users 50

# 10. Démarrer le serveur
python manage.py runserver

# 11. Démarrer Celery (dans un autre terminal)
celery -A educonnect_api worker -l info

# 12. Démarrer Channels/Daphne (dans un autre terminal)
daphne -b 0.0.0.0 -p 8001 educonnect_api.asgi:application
```

### Option 2: Avec Docker

```bash
# Build et démarrer tous les services
docker-compose up --build

# Migrations
docker-compose exec web python manage.py migrate

# Initialiser
docker-compose exec web python manage.py init_db

# Créer superuser
docker-compose exec web python manage.py createsuperuser

# Voir les logs
docker-compose logs -f web
```

---

## 📚 Endpoints API Complets

### 🔐 Authentification `/api/auth/`

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register/` | Inscription utilisateur | Non |
| POST | `/login/` | Connexion | Non |
| POST | `/token/refresh/` | Rafraîchir token | Non |
| GET | `/me/` | Profil actuel | Oui |
| PATCH | `/update_profile/` | Mise à jour profil | Oui |

**Exemple Inscription:**
```json
POST /api/auth/register/
{
  "email": "student@educonnect.africa",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "name": "Jean Dupont",
  "role": "STUDENT",
  "country": "Bénin",
  "university": "Université d'Abomey-Calavi"
}
```

**Réponse:**
```json
{
  "user": {
    "id": 1,
    "email": "student@educonnect.africa",
    "role": "STUDENT",
    "points": 0,
    "profile": {
      "name": "Jean Dupont",
      "avatar": null,
      "country": "Bénin",
      "university": "Université d'Abomey-Calavi"
    }
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### 👨‍🏫 Mentors `/api/mentors/`

| Méthode | Endpoint | Description | Filtres |
|---------|----------|-------------|---------|
| GET | `/` | Liste mentors | ?search=, ?country=, ?specialty=, ?ordering= |
| GET | `/{id}/` | Détail mentor | - |
| GET | `/my_profile/` | Mon profil mentor | - |
| PATCH | `/my_profile/` | Mettre à jour | - |
| GET | `/{id}/reviews/` | Avis mentor | - |

**Exemple Liste:**
```bash
GET /api/mentors/?country=Bénin&specialty=Informatique&ordering=-rating
```

---

### 📅 Réservations `/api/bookings/`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Mes réservations |
| POST | `/` | Créer réservation |
| GET | `/{id}/` | Détail |
| PATCH | `/{id}/update_status/` | Accepter/Refuser |
| GET | `/mentor_requests/` | Demandes reçues (mentor) |

**Exemple Création:**
```json
POST /api/bookings/
{
  "mentor_id": 5,
  "date": "2025-12-15",
  "time": "14:00:00",
  "domains": ["Informatique", "Programmation"],
  "expectations": "Je souhaite apprendre les bases de Django",
  "main_question": "Comment structurer un projet Django professionnel?"
}
```

---

### 💬 Forum `/api/forum/`

#### Questions

| Méthode | Endpoint | Description | Filtres |
|---------|----------|-------------|---------|
| GET | `/questions/` | Liste | ?search=, ?filter=solved/unsolved, ?tag= |
| POST | `/questions/` | Créer | - |
| GET | `/questions/{id}/` | Détail | - |
| PATCH | `/questions/{id}/` | Modifier | - |
| DELETE | `/questions/{id}/` | Supprimer (soft) | - |
| POST | `/questions/{id}/vote/` | Voter | - |
| GET | `/questions/{id}/answers/` | Réponses | - |
| POST | `/questions/{id}/answers/` | Répondre | - |

**Exemple Création Question:**
```json
POST /api/forum/questions/
{
  "title": "Comment calculer une intégrale triple?",
  "content": "Je bloque sur cet exercice: ∫∫∫ xyz dV...",
  "tags": ["mathématiques", "intégrales", "calcul"]
}
```

#### Réponses

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/answers/{id}/vote/` | Voter |
| POST | `/answers/{id}/accept/` | Accepter (auteur question) |

---

### 🎮 Gamification `/api/gamification/`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/leaderboard/` | Classement |
| GET | `/my_badges/` | Mes badges |
| GET | `/all_badges/` | Tous les badges |
| GET | `/points_history/` | Historique points |
| GET | `/stats/` | Statistiques perso |

**Système de Points:**
- Question postée: **+10 points**
- Réponse postée: **+15 points**
- Réponse acceptée: **+50 points**
- Upvote reçu: **+5 points**
- Devenir mentor: **+100 points**
- Session complétée: **+25 points**

**Badges Disponibles:**
1. 🌱 **Premier Pas** - Première question
2. 🔍 **Curieux** - 100 points
3. ⭐ **Engagé** - 500 points
4. 🏆 **Expert** - 1000 points
5. 👑 **Maître** - 2500 points
6. 💎 **Légende** - 5000 points

---

### 💬 Messagerie `/api/messages/`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/conversations/` | Mes conversations |
| POST | `/conversations/` | Créer conversation |
| GET | `/conversations/{id}/` | Détail |
| GET | `/conversations/{id}/messages/` | Messages |
| POST | `/conversations/{id}/send_message/` | Envoyer |

**WebSocket (Temps Réel):**
```javascript
ws://localhost:8001/ws/chat/{conversation_id}/
```

---

### 🔔 Notifications `/api/notifications/`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Mes notifications |
| GET | `/{id}/` | Détail |
| POST | `/mark_all_read/` | Tout marquer lu |
| POST | `/{id}/mark_read/` | Marquer lu |
| DELETE | `/{id}/delete_notification/` | Supprimer |
| GET | `/unread_count/` | Nombre non lues |

---

### 🎓 Opportunités `/api/opportunities/`

| Méthode | Endpoint | Description | Filtres |
|---------|----------|-------------|---------|
| GET | `/` | Liste | ?type=SCHOLARSHIP/CONTEST/INTERNSHIP/TRAINING |
| GET | `/{id}/` | Détail | - |

---

### 🤖 IA `/api/ai/`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/tutor/` | Tuteur IA |

**Exemple:**
```json
POST /api/ai/tutor/
{
  "question": "Peux-tu m'expliquer le théorème de Pythagore?",
  "subject": "Mathématiques",
  "level": "Lycée"
}
```

---

## 🧪 Tests

```bash
# Lancer tous les tests
pytest

# Tests avec coverage
pytest --cov=apps --cov-report=html

# Tests spécifiques
pytest apps/users/tests.py
pytest apps/forum/tests.py::TestForum::test_create_question

# Tests verbeux
pytest -v

# Voir la sortie print
pytest -s
```

---

## 🔒 Sécurité

### Headers de Sécurité (Production)

```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
X_FRAME_OPTIONS = 'DENY'
```

### Rate Limiting (À implémenter)

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

---

## 📊 Monitoring & Logs

### Logs

```bash
# Logs Django
tail -f logs/django.log

# Logs Gunicorn
tail -f /var/log/gunicorn/error.log

# Logs Nginx
tail -f /var/log/nginx/educonnect_error.log

# Logs Celery
tail -f /var/log/celery/worker.log
```

### Sentry (Monitoring Erreurs)

```python
# settings.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production",
    traces_sample_rate=0.1
)
```

---

## 🚀 Déploiement Production

### 1. Préparer le Serveur

```bash
# Installer dépendances système
sudo apt update
sudo apt install python3.11 python3.11-venv postgresql redis nginx

# Créer utilisateur
sudo useradd -m -s /bin/bash educonnect
```

### 2. Déployer l'Application

```bash
# Cloner
cd /var/www
sudo git clone <repo> educonnect-api
sudo chown -R educonnect:educonnect educonnect-api

# Setup
cd educonnect-api
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Éditer .env avec les vraies valeurs

# Migrations
python manage.py migrate
python manage.py collectstatic --noinput
```

### 3. Configurer Systemd

```bash
# Copier les fichiers service
sudo cp systemd/gunicorn.service /etc/systemd/system/
sudo cp systemd/celery.service /etc/systemd/system/

# Activer et démarrer
sudo systemctl enable gunicorn celery
sudo systemctl start gunicorn celery
```

### 4. Configurer Nginx

```bash
# Copier la config
sudo cp nginx/educonnect.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/educonnect.conf /etc/nginx/sites-enabled/

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.educonnect.africa
```

### 6. Script de Déploiement Automatique

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

---

## 🔄 Maintenance

### Backup Base de Données

```bash
# Backup manuel
pg_dump educonnect_db > backup_$(date +%Y%m%d).sql

# Backup automatique (cron)
0 2 * * * pg_dump educonnect_db > /var/backups/educonnect/db_$(date +\%Y\%m\%d).sql
```

### Nettoyage

```bash
# Supprimer anciennes versions (soft deleted)
python manage.py shell
>>> from django.utils import timezone
>>> from datetime import timedelta
>>> cutoff = timezone.now() - timedelta(days=90)
>>> # Archiver les données anciennes...
```

---

## 📖 Documentation Interactive

Une fois l'API lancée:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Admin Django**: http://localhost:8000/admin/

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request

---

## 📝 Notes Importantes

### Traçabilité des Données

- **Aucune suppression physique** : Toutes les suppressions sont des soft deletes
- **Versioning** : Chaque modification crée un nouvel enregistrement
- **Audit Trail** : Timestamps et historiques complets
- **Récupération** : Possibilité de restaurer les données

### Performance

- **Indexes** : Sur tous les champs fréquemment filtrés
- **Pagination** : 20 items par page par défaut
- **Caching Redis** : Pour sessions et Celery
- **Connection Pooling** : PostgreSQL avec `CONN_MAX_AGE=600`

### Scalabilité

- **Horizontal** : Ajouter des workers Gunicorn/Celery
- **Vertical** : Augmenter ressources serveur
- **Database** : PostgreSQL supporte des millions de rows
- **CDN** : Pour fichiers statiques/media

---

## 📞 Support

- **Email**: support@educonnect.africa
- **Documentation**: https://docs.educonnect.africa
- **Issues**: https://github.com/hypee/educonnect-api/issues

---

**Développé avec ❤️ par Initiative Hypee - Bénin 🇧🇯**
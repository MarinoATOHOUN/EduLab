# EduConnect 🚀

EduConnect est une plateforme éducative moderne intégrant des outils d'apprentissage, un tuteur IA, un système de mentorat et des fonctionnalités communautaires.

## 🛠 Technologies utilisées

- **Backend** : Django, Django REST Framework, Channels (WebSockets), Celery, PostgreSQL, Redis.
- **Frontend** : React, Vite, Tailwind CSS.
- **Infrastructure** : Docker, Docker Compose.

## 📋 Prérequis

Assurez-vous d'avoir installé :
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 Démarrage rapide

### 1. Configuration de l'environnement

Créez un fichier `.env` dans le dossier `backend/` en vous basant sur `backend/.env.exemple` :

```bash
cp backend/.env.exemple backend/.env
```

Éditez `backend/.env` pour y ajouter vos clés API (notamment `GEMINI_API_KEY`).

### 2. Lancement avec Docker

À la racine du projet, lancez la commande suivante :

```bash
docker compose up -d --build
```

Cette commande va construire et démarrer les services suivants :
- **db** : Base de données PostgreSQL (Port 5433)
- **redis** : Cache et Broker pour Celery/Channels (Port 6380)
- **backend** : API Django (Port 8000)
- **frontend** : Application React (Port 5173)
- **celery** : Worker pour les tâches de fond
- **channels** : Serveur Daphne pour les WebSockets (Port 8001)

### 3. Initialisation de la base de données

Une fois les conteneurs démarrés, appliquez les migrations et créez un compte administrateur :

```bash
# Appliquer les migrations
docker compose exec backend python manage.py migrate

# Créer un super-utilisateur
docker compose exec backend python manage.py createsuperuser

# Charger les données initiales (outils, stats, etc.)
docker compose exec backend python init_tools.py
docker compose exec backend python init_socials.py
docker compose exec backend python init_stats.py
docker compose exec backend python init_testimonials.py
```

## 🔗 Accès aux services

- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **API Backend** : [http://localhost:8000/api/](http://localhost:8000/api/)
- **Admin Django** : [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **Documentation API (Swagger)** : [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

## 🛠 Commandes utiles

- **Voir les logs** : `docker compose logs -f`
- **Arrêter les services** : `docker compose down`
- **Redémarrer un service spécifique** : `docker compose restart backend`
- **Accéder au shell Django** : `docker compose exec backend python manage.py shell`

## 📁 Structure du projet

```text
.
├── backend/            # Code source Django
├── frontend/           # Code source React (Vite)
├── docker-compose.yml  # Orchestration des services
└── README.md           # Documentation du projet
```

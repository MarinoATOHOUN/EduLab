"""
==============================================
TESTS & DÉPLOIEMENT
==============================================
"""

# ============================================
# apps/users/tests.py
# ============================================
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

@pytest.mark.django_db
class TestAuthentication:
    """Tests d'authentification"""
    
    def setup_method(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
    
    def test_user_registration(self):
        """Test inscription utilisateur"""
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'name': 'Test User',
            'role': 'STUDENT'
        }
        
        response = self.client.post(self.register_url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'user' in response.data
        assert 'tokens' in response.data
        assert response.data['user']['email'] == 'test@example.com'
    
    def test_user_login(self):
        """Test connexion utilisateur"""
        # Créer un utilisateur
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            role='STUDENT'
        )
        
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }
        
        response = self.client.post(self.login_url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'tokens' in response.data
        assert 'access' in response.data['tokens']
    
    def test_get_current_user(self):
        """Test récupération profil actuel"""
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            role='STUDENT'
        )
        
        self.client.force_authenticate(user=user)
        response = self.client.get('/api/auth/me/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'test@example.com'


# ============================================
# apps/forum/tests.py
# ============================================
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User, UserProfile
from apps.forum.models import Question, QuestionTitle, QuestionContent

@pytest.mark.django_db
class TestForum:
    """Tests du forum"""
    
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='student@test.com',
            password='pass123',
            role='STUDENT'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            name='Student Test'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_question(self):
        """Test création de question"""
        data = {
            'title': 'Comment résoudre cette équation?',
            'content': 'J\'ai besoin d\'aide pour résoudre x^2 + 5x + 6 = 0',
            'tags': ['mathématiques', 'algèbre']
        }
        
        response = self.client.post('/api/forum/questions/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Question.objects.count() == 1
        
        question = Question.objects.first()
        assert question.author == self.user
        assert question.tags.count() == 2
    
    def test_vote_question(self):
        """Test vote sur une question"""
        # Créer une question
        question = Question.objects.create(
            author=self.user,
            profile=self.profile
        )
        QuestionTitle.objects.create(
            question=question,
            title='Test Question'
        )
        
        # Upvote
        response = self.client.post(
            f'/api/forum/questions/{question.id}/vote/',
            {'vote_type': 1}
        )
        
        assert response.status_code == status.HTTP_200_OK
        question.refresh_from_db()
        assert question.votes == 1
    
    def test_answer_question(self):
        """Test réponse à une question"""
        question = Question.objects.create(
            author=self.user,
            profile=self.profile
        )
        QuestionTitle.objects.create(question=question, title='Test')
        
        response = self.client.post(
            f'/api/forum/questions/{question.id}/answers/',
            {'content': 'Voici ma réponse détaillée...'}
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert question.answers.count() == 1


# ============================================
# apps/gamification/tests.py
# ============================================
import pytest
from rest_framework.test import APIClient
from apps.users.models import User
from apps.gamification.models import Badge, UserBadge, BadgeName, BadgeCriteria
from apps.gamification.services import BadgeService

@pytest.mark.django_db
class TestGamification:
    """Tests gamification"""
    
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@test.com',
            password='pass123',
            role='STUDENT'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_points_attribution(self):
        """Test attribution de points"""
        initial_points = self.user.points
        
        self.user.add_points(50, 'test_action')
        
        assert self.user.points == initial_points + 50
        assert self.user.points_history.count() == 1
    
    def test_badge_award(self):
        """Test attribution de badge"""
        # Créer un badge
        badge = Badge.objects.create(code='test_badge')
        BadgeName.objects.create(badge=badge, name='Test Badge')
        BadgeCriteria.objects.create(
            badge=badge,
            criteria_type='POINTS_THRESHOLD',
            criteria_value={'points': 100}
        )
        
        # Ajouter des points
        self.user.points = 100
        self.user.save()
        
        # Vérifier badges
        BadgeService.check_and_award_badges(self.user)
        
        assert self.user.user_badges.filter(badge=badge, is_active=True).exists()
    
    def test_leaderboard(self):
        """Test classement"""
        # Créer des utilisateurs avec différents points
        for i in range(5):
            user = User.objects.create_user(
                email=f'user{i}@test.com',
                password='pass123',
                role='STUDENT'
            )
            user.points = (i + 1) * 100
            user.save()
        
        response = self.client.get('/api/gamification/leaderboard/')
        
        assert response.status_code == 200
        assert len(response.data['results']) > 0
        # Vérifier que c'est trié par points décroissants
        points = [u['points'] for u in response.data['results']]
        assert points == sorted(points, reverse=True)


# ============================================
# pytest.ini
# ============================================
pytest_ini = """
[pytest]
DJANGO_SETTINGS_MODULE = educonnect_api.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts = 
    --verbose
    --tb=short
    --strict-markers
    --disable-warnings
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
"""


# ============================================
# conftest.py (Configuration pytest)
# ============================================
conftest = """
import pytest
from django.conf import settings
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(db):
    from apps.users.models import User
    client = APIClient()
    user = User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        role='STUDENT'
    )
    client.force_authenticate(user=user)
    return client, user

@pytest.fixture
def create_user(db):
    def make_user(**kwargs):
        from apps.users.models import User
        defaults = {
            'email': 'user@test.com',
            'password': 'pass123',
            'role': 'STUDENT'
        }
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)
    return make_user
"""


# ============================================
# .github/workflows/ci.yml (GitHub Actions)
# ============================================
github_actions = """
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run migrations
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      run: |
        python manage.py migrate
    
    - name: Run tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_HOST: localhost
      run: |
        pytest --cov=apps --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        fail_ci_if_error: true
    
    - name: Lint with flake8
      run: |
        flake8 apps --count --select=E9,F63,F7,F82 --show-source --statistics
        flake8 apps --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
      run: |
        echo "Déploiement vers production..."
        # Commandes de déploiement
"""


# ============================================
# deploy.sh (Script de déploiement)
# ============================================
deploy_script = """
#!/bin/bash
set -e

echo "🚀 Début du déploiement EduConnect Africa API..."

# Variables
APP_DIR="/var/www/educonnect-api"
VENV_DIR="$APP_DIR/venv"
BACKUP_DIR="/var/backups/educonnect"

# Couleurs
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

# Fonction d'affichage
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que le script est exécuté en tant que root ou avec sudo
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root ou avec sudo"
   exit 1
fi

# Backup de la base de données
log_info "Sauvegarde de la base de données..."
mkdir -p $BACKUP_DIR
pg_dump educonnect_db > "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"

# Activer le mode maintenance
log_info "Activation du mode maintenance..."
touch $APP_DIR/maintenance.flag

# Git pull
log_info "Récupération des dernières modifications..."
cd $APP_DIR
git pull origin main

# Activer l'environnement virtuel
log_info "Activation de l'environnement virtuel..."
source $VENV_DIR/bin/activate

# Installer les dépendances
log_info "Installation des dépendances..."
pip install -r requirements.txt

# Collecter les fichiers statiques
log_info "Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Migrations
log_info "Application des migrations..."
python manage.py migrate

# Redémarrer les services
log_info "Redémarrage des services..."
systemctl restart gunicorn
systemctl restart celery
systemctl restart daphne

# Désactiver le mode maintenance
log_info "Désactivation du mode maintenance..."
rm -f $APP_DIR/maintenance.flag

# Vérifier la santé de l'application
log_info "Vérification de la santé de l'application..."
sleep 5
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/auth/login/)

if [ $response -eq 200 ] || [ $response -eq 405 ]; then
    log_info "✅ Déploiement réussi!"
else
    log_error "❌ L'application ne répond pas correctement (HTTP $response)"
    log_warning "Restauration du backup..."
    # Commandes de rollback ici
    exit 1
fi

log_info "🎉 Déploiement terminé avec succès!"
"""


# ============================================
# systemd/gunicorn.service
# ============================================
gunicorn_service = """
[Unit]
Description=Gunicorn daemon for EduConnect Africa API
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
RuntimeDirectory=gunicorn
WorkingDirectory=/var/www/educonnect-api
Environment="PATH=/var/www/educonnect-api/venv/bin"
ExecStart=/var/www/educonnect-api/venv/bin/gunicorn \\
          --workers 4 \\
          --bind unix:/run/gunicorn.sock \\
          --timeout 120 \\
          --access-logfile /var/log/gunicorn/access.log \\
          --error-logfile /var/log/gunicorn/error.log \\
          --log-level info \\
          educonnect_api.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
"""


# ============================================
# systemd/celery.service
# ============================================
celery_service = """
[Unit]
Description=Celery Worker for EduConnect Africa
After=network.target redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/educonnect-api
Environment="PATH=/var/www/educonnect-api/venv/bin"
ExecStart=/var/www/educonnect-api/venv/bin/celery -A educonnect_api worker \\
          --loglevel=info \\
          --logfile=/var/log/celery/worker.log \\
          --pidfile=/var/run/celery/worker.pid
ExecStop=/bin/kill -s TERM $MAINPID
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
"""


# ============================================
# nginx/educonnect.conf
# ============================================
nginx_conf = """
upstream educonnect_api {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

upstream educonnect_ws {
    server localhost:8001;
}

server {
    listen 80;
    server_name api.educonnect.africa;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.educonnect.africa;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.educonnect.africa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.educonnect.africa/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    client_max_body_size 10M;
    
    # Logs
    access_log /var/log/nginx/educonnect_access.log;
    error_log /var/log/nginx/educonnect_error.log;
    
    # Mode maintenance
    location @maintenance {
        return 503;
    }
    
    error_page 503 @maintenance;
    
    if (-f /var/www/educonnect-api/maintenance.flag) {
        return 503;
    }
    
    # Static files
    location /static/ {
        alias /var/www/educonnect-api/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /var/www/educonnect-api/media/;
        expires 30d;
    }
    
    # WebSocket
    location /ws/ {
        proxy_pass http://educonnect_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API
    location / {
        proxy_pass http://educonnect_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
"""

print("Tests et déploiement créés avec succès!")
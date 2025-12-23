# --- Étape 1 : Build du Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# On s'assure que l'API pointe vers le même domaine en prod
ENV VITE_API_URL=/api
RUN npm run build

# --- Étape 2 : Image finale ---
FROM python:3.12-slim

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    nginx \
    redis-server \
    gcc \
    libpq-dev \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installation des dépendances Python
COPY backend/requirements.txt ./backend/
RUN pip install --upgrade pip && pip install -r backend/requirements.txt
RUN pip install gunicorn daphne

# Copie du code Backend
COPY backend/ ./backend/

# Copie du build Frontend depuis l'étape 1
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

# Copie des configurations
COPY nginx.conf /etc/nginx/sites-available/default
COPY supervisord.conf ./supervisord.conf
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Configuration Django pour Hugging Face
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=educonnect.settings
# On force SQLite pour Hugging Face si aucune DB n'est fournie
ENV DB_HOST="" 

# Hugging Face écoute sur le port 7860
EXPOSE 7860

CMD ["./start.sh"]

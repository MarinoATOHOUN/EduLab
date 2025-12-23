#!/bin/bash

# Aller dans le dossier backend
cd /app/backend

# Appliquer les migrations
echo "Applying migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques de Django (Admin, etc.)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Initialiser les données si nécessaire (optionnel)
# python init_tools.py

# Lancer supervisor
echo "Starting all services via Supervisor..."
exec supervisord -c /app/supervisord.conf

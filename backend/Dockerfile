FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \\
    postgresql-client \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copier requirements
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copier le projet
COPY . /app/

# Créer les dossiers
RUN mkdir -p logs media staticfiles

# Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "educonnect_api.wsgi:application"]

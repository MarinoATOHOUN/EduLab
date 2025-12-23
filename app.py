import subprocess
import os
import time
import sys

def run_command(command, cwd=None):
    print(f"🚀 Exécution : {command}")
    try:
        subprocess.run(command, shell=True, check=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'exécution de {command}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("--- Démarrage de l'initialisation EduConnect ---")

    # 1. Migrations Django
    run_command("python manage.py migrate --noinput", cwd="/app/backend")

    # 2. Collecte des fichiers statiques
    run_command("python manage.py collectstatic --noinput", cwd="/app/backend")

    # 3. Lancement de Supervisor (qui gère Redis, Daphne, Nginx et Celery)
    print("--- Lancement des services via Supervisor ---")
    os.system("supervisord -c /app/supervisord.conf")

from django.core.management.base import BaseCommand
from apps.gamification.services import BadgeService

class Command(BaseCommand):
    help = 'Initialiser la base de données avec les données par défaut'
    
    def handle(self, *args, **options):
        self.stdout.write('Initialisation de la base de données...')
        
        # Créer les badges par défaut
        self.stdout.write('Création des badges par défaut...')
        BadgeService.initialize_default_badges()
        
        self.stdout.write(self.style.SUCCESS('Base de données initialisée avec succès!'))
"""
Commande pour initialiser les badges par défaut dans la base de données
"""
from django.core.management.base import BaseCommand
from apps.gamification.services import BadgeService
from apps.gamification.models import Badge


class Command(BaseCommand):
    help = 'Initialise les badges par défaut dans la base de données'

    def handle(self, *args, **options):
        self.stdout.write('Initialisation des badges...')
        
        # Compter les badges existants
        existing_count = Badge.objects.count()
        self.stdout.write(f'Badges existants: {existing_count}')
        
        # Initialiser les badges par défaut
        BadgeService.initialize_default_badges()
        
        # Compter les badges après initialisation
        new_count = Badge.objects.count()
        created_count = new_count - existing_count
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Badges initialisés avec succès! '
                f'{created_count} nouveaux badges créés. Total: {new_count}'
            )
        )
        
        # Afficher la liste des badges
        self.stdout.write('\nListe des badges:')
        for badge in Badge.objects.all():
            name = badge.names.filter(is_current=True).first()
            desc = badge.descriptions.filter(is_current=True).first()
            icon = badge.icons.filter(is_current=True).first()
            
            self.stdout.write(
                f'  - {icon.icon if icon else "?"} {name.name if name else badge.code}: '
                f'{desc.description if desc else "Pas de description"}'
            )

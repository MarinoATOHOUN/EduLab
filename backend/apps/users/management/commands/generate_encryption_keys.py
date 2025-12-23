# ============================================
# apps/users/management/commands/generate_encryption_keys.py
# ============================================
from django.core.management.base import BaseCommand
from apps.users.models import UserProfile
from apps.users.encryption import ensure_user_has_keys


class Command(BaseCommand):
    help = 'Génère les clés de chiffrement pour tous les profils qui n\'en ont pas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Régénère les clés même si elles existent déjà',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        # Récupérer tous les profils courants
        profiles = UserProfile.objects.filter(is_current=True)
        
        if not force:
            # Filtrer ceux qui n'ont pas de clés
            profiles = profiles.filter(
                public_key__isnull=True
            ) | profiles.filter(
                public_key=''
            ) | profiles.filter(
                encrypted_private_key__isnull=True
            ) | profiles.filter(
                encrypted_private_key=''
            )
        
        total = profiles.count()
        self.stdout.write(f"Profils à traiter: {total}")
        
        success = 0
        failed = 0
        
        for profile in profiles:
            if ensure_user_has_keys(profile):
                success += 1
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Clés générées pour {profile.user.email}")
                )
            else:
                failed += 1
                self.stdout.write(
                    self.style.ERROR(f"✗ Échec pour {profile.user.email}")
                )
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f"Terminé: {success} succès, {failed} échecs"))

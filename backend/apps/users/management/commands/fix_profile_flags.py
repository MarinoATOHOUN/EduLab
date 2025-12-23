# ============================================
# apps/users/management/commands/fix_profile_flags.py
# ============================================
from django.core.management.base import BaseCommand
from apps.users.models import UserProfile


class Command(BaseCommand):
    help = 'Corrige les flags is_current des profils utilisateurs'

    def handle(self, *args, **options):
        # Trouver tous les profils sans is_current=True
        profiles_to_fix = UserProfile.objects.filter(is_current=False)
        
        total = profiles_to_fix.count()
        self.stdout.write(f"Profils à corriger: {total}")
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS("Tous les profils sont déjà corrects!"))
            return
        
        # Mettre à jour tous les profils
        updated = profiles_to_fix.update(is_current=True)
        
        self.stdout.write(
            self.style.SUCCESS(f"✓ {updated} profils mis à jour avec is_current=True")
        )
        
        # Vérifier que tous ont des clés
        profiles_without_keys = UserProfile.objects.filter(
            is_current=True
        ).filter(
            public_key__isnull=True
        ) | UserProfile.objects.filter(
            is_current=True,
            public_key=''
        )
        
        if profiles_without_keys.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"\n⚠ {profiles_without_keys.count()} profils n'ont pas de clés de chiffrement."
                )
            )
            self.stdout.write(
                "Exécutez: python manage.py generate_encryption_keys"
            )

"""
Commande pour nettoyer les profils utilisateurs en double
"""
from django.core.management.base import BaseCommand
from apps.users.models import User, UserProfile


class Command(BaseCommand):
    help = 'Nettoie les profils utilisateurs en double en gardant le plus récent'

    def handle(self, *args, **options):
        self.stdout.write('Nettoyage des profils en double...')
        
        # Récupérer tous les utilisateurs
        users = User.objects.all()
        fixed_count = 0
        
        for user in users:
            # Récupérer tous les profils de cet utilisateur
            profiles = UserProfile.objects.filter(user=user).order_by('-created_at')
            
            if profiles.count() > 1:
                self.stdout.write(f'  Utilisateur {user.email} a {profiles.count()} profils')
                
                # Garder le plus récent (le premier dans la liste)
                main_profile = profiles.first()
                
                # Désactiver les autres
                for profile in profiles[1:]:
                    profile.is_current = False
                    profile.save()
                    self.stdout.write(f'    - Profil {profile.id} désactivé')
                
                # S'assurer que le profil principal est actif
                if not main_profile.is_current:
                    main_profile.is_current = True
                    main_profile.save()
                
                fixed_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Nettoyage terminé! {fixed_count} utilisateurs avec profils en double corrigés.'
            )
        )

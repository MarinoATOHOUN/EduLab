# ============================================
# apps/users/signals.py - Signaux pour les utilisateurs
# ============================================
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender='users.UserProfile')
def generate_encryption_keys_on_profile_create(sender, instance, created, **kwargs):
    """
    Génère automatiquement les clés de chiffrement quand un profil est créé
    ou si le profil n'a pas de clés.
    """
    # Vérifier si le profil n'a pas déjà de clés
    if not instance.public_key or not instance.encrypted_private_key:
        try:
            from apps.users.encryption import generate_rsa_keypair
            
            public_key, private_key = generate_rsa_keypair()
            
            if public_key and private_key:
                # Utiliser update() pour éviter de déclencher à nouveau le signal
                from apps.users.models import UserProfile
                UserProfile.objects.filter(pk=instance.pk).update(
                    public_key=public_key,
                    encrypted_private_key=private_key,
                    is_current=True  # S'assurer que le profil est actif
                )
                logger.info(f"Clés de chiffrement générées pour le profil {instance.pk}")
        except Exception as e:
            logger.error(f"Erreur lors de la génération des clés: {e}")


@receiver(post_save, sender='users.User')
def ensure_user_profile_has_keys(sender, instance, created, **kwargs):
    """
    S'assure que le profil courant de l'utilisateur a des clés de chiffrement.
    """
    try:
        profile = instance.profiles.filter(is_current=True).first()
        
        if profile and (not profile.public_key or not profile.encrypted_private_key):
            from apps.users.encryption import ensure_user_has_keys
            ensure_user_has_keys(profile)
    except Exception as e:
        logger.error(f"Erreur lors de la vérification des clés utilisateur: {e}")

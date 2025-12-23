# ============================================
# apps/bookings/signals.py - Signaux pour les réservations
# ============================================
from django.db.models.signals import post_save
from django.dispatch import receiver
import datetime
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender='bookings.Booking')
def schedule_tasks_on_confirm(sender, instance, created, **kwargs):
    """
    Quand un booking passe en CONFIRMED:
    1. Planifie le déblocage des messages
    2. Planifie les rappels de rendez-vous
    """
    from django.utils import timezone
    
    # Ne traiter que les bookings confirmés
    if instance.status != 'CONFIRMED':
        return
    
    # Calculer l'heure de début
    booking_start = datetime.datetime.combine(instance.date, instance.time)
    booking_start = timezone.make_aware(booking_start)
    now = timezone.now()
    
    # === 1. Déblocage des messages ===
    if booking_start <= now:
        try:
            from apps.messaging.tasks import unlock_messages_for_booking
            # Exécuter immédiatement
            unlock_messages_for_booking.delay(instance.id)
            logger.info(f"Déblocage immédiat des messages pour booking {instance.id}")
        except Exception as e:
            logger.error(f"Erreur lors du déblocage immédiat: {e}")
    else:
        try:
            from apps.messaging.tasks import unlock_messages_for_booking
            # Planifier l'exécution à l'heure du booking
            unlock_messages_for_booking.apply_async(
                args=[instance.id],
                eta=booking_start
            )
            logger.info(f"Déblocage planifié pour booking {instance.id} à {booking_start}")
        except Exception as e:
            logger.error(f"Erreur lors de la planification du déblocage: {e}")
    
    # === 2. Planifier les rappels de rendez-vous ===
    try:
        from apps.bookings.tasks import schedule_all_reminders
        # Planifier tous les rappels de manière asynchrone
        schedule_all_reminders.delay(instance.id)
        logger.info(f"Planification des rappels pour booking {instance.id}")
    except Exception as e:
        logger.error(f"Erreur lors de la planification des rappels: {e}")

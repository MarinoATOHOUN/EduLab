# ============================================
# apps/bookings/tasks.py - Tâches Celery pour les réservations
# ============================================
import datetime
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

# Intervalles de rappel avant le rendez-vous (en minutes)
REMINDER_INTERVALS = [
    (1440, "24 heures"),   # 24h avant
    (60, "1 heure"),       # 1h avant
    (30, "30 minutes"),    # 30min avant
    (15, "15 minutes"),    # 15min avant
    (5, "5 minutes"),      # 5min avant
]


@shared_task(name='bookings.send_booking_reminder')
def send_booking_reminder(booking_id, time_label):
    """
    Envoie une notification de rappel aux participants d'un booking.
    
    Args:
        booking_id: ID du booking
        time_label: Texte décrivant le temps restant (ex: "30 minutes")
    """
    from apps.bookings.models import Booking
    from apps.notifications.models import Notification, NotificationTitle, NotificationMessage
    from apps.notifications.services import NotificationService
    
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Vérifier que le booking est toujours confirmé
        if booking.status != 'CONFIRMED':
            logger.info(f"Booking {booking_id} n'est plus confirmé, skip reminder.")
            return
        
        # Récupérer les noms des participants
        student_profile = booking.student.profiles.filter(is_current=True).first()
        student_name = student_profile.name if student_profile else booking.student.email
        
        mentor_profile = booking.mentor.profiles.filter(is_current=True).first()
        mentor_name = mentor_profile.name if mentor_profile else booking.mentor.email
        
        # Notification pour l'étudiant
        notif_student = Notification.objects.create(
            user=booking.student,
            type='BOOKING',
            link=f'/chat?partner={booking.mentor.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_student,
            title=f'⏰ Rappel : Rendez-vous dans {time_label}'
        )
        NotificationMessage.objects.create(
            notification=notif_student,
            message=f'Votre session avec {mentor_name} commence dans {time_label}. Préparez-vous !'
        )
        NotificationService._send_ws_notification(notif_student)
        
        # Notification pour le mentor
        notif_mentor = Notification.objects.create(
            user=booking.mentor,
            type='BOOKING',
            link=f'/chat?partner={booking.student.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_mentor,
            title=f'⏰ Rappel : Rendez-vous dans {time_label}'
        )
        NotificationMessage.objects.create(
            notification=notif_mentor,
            message=f'Votre session avec {student_name} commence dans {time_label}. L\'étudiant vous attend !'
        )
        NotificationService._send_ws_notification(notif_mentor)
        
        logger.info(f"Rappel envoyé pour booking {booking_id} ({time_label})")
        return True
        
    except Booking.DoesNotExist:
        logger.error(f"Booking {booking_id} introuvable")
        return False
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du rappel: {e}")
        raise


@shared_task(name='bookings.send_booking_starting_now')
def send_booking_starting_now(booking_id):
    """
    Notification spéciale quand le rendez-vous commence.
    """
    from apps.bookings.models import Booking
    from apps.notifications.models import Notification, NotificationTitle, NotificationMessage
    from apps.notifications.services import NotificationService
    
    try:
        booking = Booking.objects.get(id=booking_id)
        
        if booking.status != 'CONFIRMED':
            return
        
        # Récupérer les noms
        student_profile = booking.student.profiles.filter(is_current=True).first()
        student_name = student_profile.name if student_profile else booking.student.email
        
        mentor_profile = booking.mentor.profiles.filter(is_current=True).first()
        mentor_name = mentor_profile.name if mentor_profile else booking.mentor.email
        
        # Notification pour l'étudiant
        notif_student = Notification.objects.create(
            user=booking.student,
            type='BOOKING',
            link=f'/chat?partner={booking.mentor.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_student,
            title='🚀 C\'est l\'heure de votre session !'
        )
        NotificationMessage.objects.create(
            notification=notif_student,
            message=f'Votre session de mentorat avec {mentor_name} commence maintenant. Cliquez pour rejoindre le chat.'
        )
        NotificationService._send_ws_notification(notif_student)
        
        # Notification pour le mentor
        notif_mentor = Notification.objects.create(
            user=booking.mentor,
            type='BOOKING',
            link=f'/chat?partner={booking.student.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_mentor,
            title='🚀 C\'est l\'heure de votre session !'
        )
        NotificationMessage.objects.create(
            notification=notif_mentor,
            message=f'Votre session avec {student_name} commence maintenant. L\'étudiant vous attend !'
        )
        NotificationService._send_ws_notification(notif_mentor)
        
        logger.info(f"Notification de démarrage envoyée pour booking {booking_id}")
        return True
        
    except Booking.DoesNotExist:
        logger.error(f"Booking {booking_id} introuvable")
        return False
    except Exception as e:
        logger.error(f"Erreur: {e}")
        raise


@shared_task(name='bookings.schedule_all_reminders')
def schedule_all_reminders(booking_id):
    """
    Planifie tous les rappels pour un booking.
    À appeler quand un booking est confirmé.
    """
    from apps.bookings.models import Booking
    
    try:
        booking = Booking.objects.get(id=booking_id)
        
        if booking.status != 'CONFIRMED':
            return
        
        # Calculer l'heure de début
        booking_start = datetime.datetime.combine(booking.date, booking.time)
        booking_start = timezone.make_aware(booking_start)
        now = timezone.now()
        
        scheduled_count = 0
        
        # Planifier chaque rappel
        for minutes_before, label in REMINDER_INTERVALS:
            reminder_time = booking_start - datetime.timedelta(minutes=minutes_before)
            
            # Ne planifier que les rappels dans le futur
            if reminder_time > now:
                send_booking_reminder.apply_async(
                    args=[booking_id, label],
                    eta=reminder_time
                )
                scheduled_count += 1
                logger.info(f"Rappel planifié pour booking {booking_id}: {label} (à {reminder_time})")
        
        # Planifier la notification de démarrage
        if booking_start > now:
            send_booking_starting_now.apply_async(
                args=[booking_id],
                eta=booking_start
            )
            logger.info(f"Notification de démarrage planifiée pour booking {booking_id}")
        
        return f"Planifié {scheduled_count} rappels pour booking {booking_id}"
        
    except Booking.DoesNotExist:
        logger.error(f"Booking {booking_id} introuvable")
        return None
    except Exception as e:
        logger.error(f"Erreur lors de la planification: {e}")
        raise

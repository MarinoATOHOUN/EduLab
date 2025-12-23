# ============================================
# apps/messaging/tasks.py - Tâches Celery pour la messagerie
# ============================================
import datetime
from celery import shared_task
from django.utils import timezone
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)


@shared_task(name='messaging.unlock_messages_for_booking')
def unlock_messages_for_booking(booking_id):
    """
    Débloque tous les messages en attente entre deux utilisateurs
    quand leur rendez-vous commence.
    
    Cette tâche est planifiée pour s'exécuter à l'heure de début du booking.
    """
    from apps.bookings.models import Booking
    from apps.messaging.models import Conversation, Message
    
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Vérifier que le booking est toujours confirmé
        if booking.status != 'CONFIRMED':
            logger.info(f"Booking {booking_id} n'est plus confirmé, skip.")
            return
        
        student = booking.student
        mentor = booking.mentor
        
        # Trouver la conversation entre ces deux users
        conversation = Conversation.objects.filter(
            participants__user=student,
            participants__is_active=True,
            is_active=True
        ).filter(
            participants__user=mentor,
            participants__is_active=True
        ).first()
        
        if not conversation:
            logger.info(f"Pas de conversation entre {student.id} et {mentor.id}")
            return
        
        # Débloquer tous les messages en attente dans cette conversation
        updated_count = Message.objects.filter(
            conversation=conversation,
            is_visible_to_recipient=False,
            is_active=True
        ).update(is_visible_to_recipient=True)
        
        logger.info(f"Débloqué {updated_count} messages pour booking {booking_id}")
        
        # Notifier les utilisateurs via WebSocket que des messages sont disponibles
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            
            async_to_sync(channel_layer.group_send)(
                f'chat_{conversation.id}',
                {
                    'type': 'messages_unlocked',
                    'count': updated_count
                }
            )
        except Exception as e:
            logger.warning(f"Impossible de notifier via WebSocket: {e}")
        
        return updated_count
        
    except Booking.DoesNotExist:
        logger.error(f"Booking {booking_id} introuvable")
        return 0
    except Exception as e:
        logger.error(f"Erreur lors du déblocage des messages: {e}")
        raise


@shared_task(name='messaging.schedule_unlock_for_upcoming_bookings')
def schedule_unlock_for_upcoming_bookings():
    """
    Tâche périodique qui vérifie les bookings confirmés à venir
    et planifie le déblocage des messages pour chacun.
    
    À exécuter toutes les 5-10 minutes via Celery Beat.
    """
    from apps.bookings.models import Booking
    from django_celery_beat.models import PeriodicTask, ClockedSchedule
    import json
    
    now = timezone.now()
    
    # Trouver les bookings confirmés qui commencent dans les 15 prochaines minutes
    # et pour lesquels on n'a pas encore planifié de tâche
    upcoming_bookings = Booking.objects.filter(
        status='CONFIRMED',
        date=now.date(),
        time__gte=now.time(),
        is_active=True
    )
    
    for booking in upcoming_bookings:
        # Calculer l'heure de début
        booking_start = datetime.datetime.combine(booking.date, booking.time)
        booking_start = timezone.make_aware(booking_start)
        
        # Si le booking commence dans moins de 15 minutes
        if booking_start <= now + datetime.timedelta(minutes=15):
            task_name = f'unlock_msgs_booking_{booking.id}'
            
            # Vérifier si la tâche existe déjà
            if not PeriodicTask.objects.filter(name=task_name).exists():
                try:
                    # Créer un schedule pour l'heure exacte
                    clocked, _ = ClockedSchedule.objects.get_or_create(
                        clocked_time=booking_start
                    )
                    
                    PeriodicTask.objects.create(
                        clocked=clocked,
                        name=task_name,
                        task='messaging.unlock_messages_for_booking',
                        args=json.dumps([booking.id]),
                        one_off=True,  # Ne s'exécute qu'une fois
                        enabled=True
                    )
                    
                    logger.info(f"Tâche planifiée pour booking {booking.id} à {booking_start}")
                except Exception as e:
                    logger.error(f"Erreur lors de la planification pour booking {booking.id}: {e}")
    
    return f"Vérifié {upcoming_bookings.count()} bookings"


@shared_task(name='messaging.check_pending_messages')
def check_pending_messages():
    """
    Tâche périodique de sécurité qui vérifie s'il y a des messages
    qui auraient dû être débloqués mais ne l'ont pas été.
    
    Utile en cas de redémarrage du serveur ou de tâche ratée.
    """
    from apps.messaging.models import Message
    from apps.bookings.models import Booking
    
    now = timezone.now()
    
    # Trouver les messages en attente dont l'expéditeur et le destinataire
    # ont eu un booking qui a déjà commencé
    pending_messages = Message.objects.filter(
        is_visible_to_recipient=False,
        is_active=True
    ).select_related('conversation', 'sender')
    
    unlocked_total = 0
    
    for message in pending_messages:
        conversation = message.conversation
        sender = message.sender
        
        # Trouver le destinataire
        recipient_part = conversation.participants.exclude(user=sender).filter(is_active=True).first()
        if not recipient_part:
            continue
            
        recipient = recipient_part.user
        
        # Vérifier s'il y a un booking passé ou en cours entre eux
        booking = Booking.objects.filter(
            Q(student=sender, mentor=recipient) | Q(student=recipient, mentor=sender),
            status='CONFIRMED',
            is_active=True
        ).filter(
            Q(date__lt=now.date()) | 
            Q(date=now.date(), time__lte=now.time())
        ).first()
        
        if booking:
            message.is_visible_to_recipient = True
            message.save(update_fields=['is_visible_to_recipient'])
            unlocked_total += 1
    
    if unlocked_total > 0:
        logger.info(f"Check périodique: débloqué {unlocked_total} messages")
    
    return unlocked_total

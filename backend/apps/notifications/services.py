"""
==============================================
SERVICES & SIGNALS - EDULAB AFRICA API
==============================================
"""

# ============================================
# apps/notifications/services.py
# ============================================
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.notifications.serializers import NotificationSerializer
from apps.notifications.models import Notification, NotificationTitle, NotificationMessage

class NotificationService:
    """Service centralisé pour créer des notifications"""

    @staticmethod
    def _send_ws_notification(notification):
        """Envoyer la notification via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            group_name = f"user_{notification.user.id}"
            serializer = NotificationSerializer(notification)
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification': serializer.data
                }
            )
        except Exception as e:
            pass
    
    @staticmethod
    def create_booking_notification(booking):
        """Notification au mentor pour nouvelle demande"""
        notif = Notification.objects.create(
            user=booking.mentor,
            type='BOOKING',
            link=f'/bookings/{booking.id}'
        )
        
        NotificationTitle.objects.create(
            notification=notif,
            title='Nouvelle demande de mentorat'
        )
        
        profile = booking.student.profiles.filter(is_current=True).first()
        student_name = profile.name if profile else booking.student.email
        
        NotificationMessage.objects.create(
            notification=notif,
            message=f'{student_name} souhaite réserver une session avec vous le {booking.date} à {booking.time}'
        )
        
        NotificationService._send_ws_notification(notif)
        return notif
    
    @staticmethod
    def create_booking_status_notification(booking):
        """Notification à l'étudiant sur changement de statut"""
        status_messages = {
            'CONFIRMED': 'Votre demande de mentorat a été acceptée',
            'REJECTED': 'Votre demande de mentorat a été déclinée',
            'COMPLETED': 'Votre session de mentorat est terminée',
            'CANCELLED': 'Votre session de mentorat a été annulée'
        }
        
        notif = Notification.objects.create(
            user=booking.student,
            type='BOOKING',
            link=f'/bookings/{booking.id}'
        )
        
        NotificationTitle.objects.create(
            notification=notif,
            title='Mise à jour de votre réservation'
        )
        
        NotificationMessage.objects.create(
            notification=notif,
            message=status_messages.get(booking.status, 'Statut de votre réservation mis à jour')
        )
        
        NotificationService._send_ws_notification(notif)
        return notif
    
    @staticmethod
    def create_answer_notification(answer):
        """Notification à l'auteur de la question"""
        if answer.author == answer.question.author:
            return None  # Pas de notif si c'est sa propre question
        
        notif = Notification.objects.create(
            user=answer.question.author,
            type='REPLY',
            link=f'/forum/questions/{answer.question.id}'
        )
        
        NotificationTitle.objects.create(
            notification=notif,
            title='Nouvelle réponse à votre question'
        )
        
        profile = answer.author.profiles.filter(is_current=True).first()
        author_name = profile.name if profile else answer.author.email
        
        question_title = answer.question.titles.filter(is_current=True).first()
        q_title = question_title.title if question_title else 'votre question'
        
        NotificationMessage.objects.create(
            notification=notif,
            message=f'{author_name} a répondu à {q_title}'
        )
        
        NotificationService._send_ws_notification(notif)
        return notif
    
    @staticmethod
    def create_message_notifications(message):
        """Notifications aux participants de la conversation"""
        participants = message.conversation.participants.filter(is_active=True).exclude(user=message.sender)
        
        notifications = []
        for participant in participants:
            notif = Notification.objects.create(
                user=participant.user,
                type='MESSAGE',
                link=f'/messages/{message.conversation.id}'
            )
            
            NotificationTitle.objects.create(
                notification=notif,
                title='Nouveau message'
            )
            
            profile = message.sender.profiles.filter(is_current=True).first()
            sender_name = profile.name if profile else message.sender.email
            
            content = message.contents.filter(is_current=True).first()
            preview = content.content[:50] if content else ''
            
            NotificationMessage.objects.create(
                notification=notif,
                message=f'{sender_name}: {preview}...'
            )
            
            notifications.append(notif)
            NotificationService._send_ws_notification(notif)
        
        return notifications
    
    @staticmethod
    def create_badge_notification(user_badge):
        """Notification pour nouveau badge"""
        notif = Notification.objects.create(
            user=user_badge.user,
            type='ACHIEVEMENT',
            link='/profile/badges'
        )
        
        NotificationTitle.objects.create(
            notification=notif,
            title='Nouveau badge débloqué !'
        )
        
        badge_name = user_badge.badge.names.filter(is_current=True).first()
        name = badge_name.name if badge_name else user_badge.badge.code
        
        NotificationMessage.objects.create(
            notification=notif,
            message=f'Félicitations ! Vous avez débloqué le badge "{name}"'
        )
        
        NotificationService._send_ws_notification(notif)
        return notif

    @staticmethod
    def create_booking_reminder(booking, hours_left):
        """Rappel de rendez-vous (X heures avant)"""
        # Notifier l'étudiant
        notif_student = Notification.objects.create(
            user=booking.student,
            type='BOOKING',
            link=f'/bookings/{booking.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_student,
            title='Rappel de rendez-vous'
        )
        NotificationMessage.objects.create(
            notification=notif_student,
            message=f'Il reste {hours_left} heures avant votre session de mentorat.'
        )
        NotificationService._send_ws_notification(notif_student)

        # Notifier le mentor
        notif_mentor = Notification.objects.create(
            user=booking.mentor,
            type='BOOKING',
            link=f'/bookings/{booking.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_mentor,
            title='Rappel de rendez-vous'
        )
        NotificationMessage.objects.create(
            notification=notif_mentor,
            message=f'Il reste {hours_left} heures avant votre session avec un étudiant.'
        )
        NotificationService._send_ws_notification(notif_mentor)
        
        return [notif_student, notif_mentor]

    @staticmethod
    def create_booking_starting_soon(booking):
        """Votre rendez-vous vous attend"""
        # Notifier l'étudiant
        notif_student = Notification.objects.create(
            user=booking.student,
            type='BOOKING',
            link=f'/bookings/{booking.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_student,
            title='C\'est l\'heure !'
        )
        NotificationMessage.objects.create(
            notification=notif_student,
            message='Votre session de mentorat commence bientôt. Connectez-vous maintenant.'
        )
        NotificationService._send_ws_notification(notif_student)

        # Notifier le mentor
        notif_mentor = Notification.objects.create(
            user=booking.mentor,
            type='BOOKING',
            link=f'/bookings/{booking.id}'
        )
        NotificationTitle.objects.create(
            notification=notif_mentor,
            title='C\'est l\'heure !'
        )
        NotificationMessage.objects.create(
            notification=notif_mentor,
            message='Votre session de mentorat commence bientôt. L\'étudiant vous attend.'
        )
        NotificationService._send_ws_notification(notif_mentor)
        
        return [notif_student, notif_mentor]

    @staticmethod
    def create_mentor_recommendation(user, mentor_profile):
        """Un nouveau profil de mentor pourrait vous intéresser"""
        notif = Notification.objects.create(
            user=user,
            type='MENTORSHIP',
            link=f'/mentors/{mentor_profile.id}'
        )
        
        NotificationTitle.objects.create(
            notification=notif,
            title='Suggestion de mentor'
        )
        
        mentor_name = mentor_profile.user.profiles.filter(is_current=True).first().name
        NotificationMessage.objects.create(
            notification=notif,
            message=f'Un nouveau profil de mentor pourrait vous intéresser : {mentor_name}. Jetez un œil !'
        )
        
        NotificationService._send_ws_notification(notif)
        return notif

    @staticmethod
    def create_tool_reengagement(user, tool_name, tool_link):
        """Vous n'avez pas utilisé tel outil récemment"""
        notif = Notification.objects.create(
            user=user,
            type='SYSTEM',
            link=tool_link
        )
        
        NotificationTitle.objects.create(
            notification=notif,
            title='On ne vous a pas vu depuis longtemps !'
        )
        
        NotificationMessage.objects.create(
            notification=notif,
            message=f'Vous n\'avez pas utilisé {tool_name} récemment. Venez découvrir les nouveautés !'
        )
        
        NotificationService._send_ws_notification(notif)
        return notif

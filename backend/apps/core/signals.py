# ============================================
# apps/core/signals.py
# ============================================
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from apps.users.models import User, UserProfile
from apps.forum.models import Question, Answer
from apps.bookings.models import Booking
from apps.mentors.models import MentorProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Créer un profil par défaut pour chaque nouvel utilisateur"""
    if created:
        # Créer profil de base si n'existe pas déjà (évite conflit avec serializer)
        if not instance.profiles.exists():
            UserProfile.objects.create(
                user=instance,
                name=instance.email.split('@')[0],  # Nom temporaire
                is_current=True
            )
        
        # Créer profil mentor si rôle MENTOR
        # if instance.role == 'MENTOR' and not hasattr(instance, 'mentor_profile'):
        #     MentorProfile.objects.create(user=instance)

@receiver(post_save, sender=Question)
def handle_question_points(sender, instance, created, **kwargs):
    """Attribution de points pour nouvelle question"""
    if created:
        instance.author.add_points(
            settings.GAMIFICATION_POINTS['QUESTION_POSTED'],
            'question_posted'
        )
        
        # Vérifier badges
        from apps.gamification.services import BadgeService
        BadgeService.check_and_award_badges(instance.author)

@receiver(post_save, sender=Answer)
def handle_answer_points(sender, instance, created, **kwargs):
    """Attribution de points pour nouvelle réponse"""
    if created:
        instance.author.add_points(
            settings.GAMIFICATION_POINTS['ANSWER_POSTED'],
            'answer_posted'
        )
        
        # Vérifier badges
        from apps.gamification.services import BadgeService
        BadgeService.check_and_award_badges(instance.author)

@receiver(post_save, sender=MentorProfile)
def handle_mentor_verification(sender, instance, created, **kwargs):
    """Gérer la vérification du mentor (Role + Points)"""
    if instance.is_verified:
        # 1. Mettre à jour le rôle utilisateur
        if instance.user.role != 'MENTOR':
            instance.user.role = 'MENTOR'
            instance.user.save(update_fields=['role'])
            
        # 2. Attribuer les points (si pas déjà fait)
        from apps.gamification.models import UserPointsHistory
        if not UserPointsHistory.objects.filter(user=instance.user, reason='become_mentor').exists():
            instance.user.add_points(
                settings.GAMIFICATION_POINTS['BECOME_MENTOR'],
                'become_mentor'
            )
            
            # Badge mentor
            from apps.gamification.services import BadgeService
            BadgeService.check_and_award_badges(instance.user)

@receiver(post_save, sender=Booking)
def handle_booking_completion(sender, instance, created, **kwargs):
    """Attribution de points pour session complétée"""
    if not created and instance.status == 'COMPLETED':
        # Points pour l'étudiant
        instance.student.add_points(
            settings.GAMIFICATION_POINTS['BOOKING_COMPLETED'],
            'booking_completed'
        )
        
        # Incrémenter sessions du mentor
        if hasattr(instance.mentor, 'mentor_profile'):
            profile = instance.mentor.mentor_profile
            profile.total_sessions += 1
            profile.save(update_fields=['total_sessions'])


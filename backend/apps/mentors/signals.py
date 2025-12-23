from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MentorApplication
from .services import MentorAIRewiewService
import threading

@receiver(post_save, sender=MentorApplication)
def trigger_ai_review(sender, instance, created, **kwargs):
    """Déclenche l'analyse IA dès qu'une candidature est soumise"""
    if created:
        # On lance l'analyse dans un thread séparé pour ne pas bloquer la réponse HTTP
        # En production, on utiliserait Celery
        thread = threading.Thread(
            target=MentorAIRewiewService.review_application,
            args=(instance.id,)
        )
        thread.start()

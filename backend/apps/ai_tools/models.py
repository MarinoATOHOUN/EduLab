# ============================================
# apps/ai_tools/models.py - Historique IA
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin
from apps.users.models import User

class AITutorSession(TimestampMixin, SoftDeleteMixin):
    """Session de tuteur IA"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_sessions')
    subject = models.CharField(max_length=100, null=True, blank=True)
    level = models.CharField(max_length=50, null=True, blank=True)
    total_questions = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'ai_tutor_sessions'
        verbose_name = 'Session Tuteur IA'
        verbose_name_plural = 'Sessions Tuteur IA'
        ordering = ['-created_at']

class AITutorQuestion(TimestampMixin):
    """Question posée au tuteur IA"""
    session = models.ForeignKey(AITutorSession, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    answer = models.TextField()
    model_used = models.CharField(max_length=50)  # gemini, gpt-4, etc.
    tokens_used = models.IntegerField(null=True, blank=True)
    response_time = models.FloatField(null=True, blank=True)  # en secondes
    
    class Meta:
        db_table = 'ai_tutor_questions'
        ordering = ['created_at']

class CodeSnippet(TimestampMixin, SoftDeleteMixin):
    """Sauvegardes du sandbox de code"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='code_snippets')
    title = models.CharField(max_length=255)
    language = models.CharField(max_length=50)
    code = models.TextField()
    description = models.TextField(null=True, blank=True)
    is_public = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'code_snippets'
        verbose_name = 'Snippet de Code'
        verbose_name_plural = 'Snippets de Code'
        ordering = ['-created_at']
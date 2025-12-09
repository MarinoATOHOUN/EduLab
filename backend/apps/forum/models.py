# ============================================
# apps/forum/models.py - Forum Questions/Réponses
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin
from apps.users.models import User, UserProfile

class Question(TimestampMixin, SoftDeleteMixin):
    """Question du forum"""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='questions_profile')
    votes = models.IntegerField(default=0, db_index=True)
    is_solved = models.BooleanField(default=False, db_index=True)
    views_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'questions'
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        indexes = [
            models.Index(fields=['-votes', '-created_at']),
            models.Index(fields=['is_solved', '-created_at']),
            models.Index(fields=['author', 'is_active']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        title = self.titles.filter(is_current=True).first()
        return title.title if title else f"Question #{self.id}"

class QuestionTitle(TimestampMixin, VersionedFieldMixin):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='titles')
    title = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'question_titles'

class QuestionContent(TimestampMixin, VersionedFieldMixin):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='contents')
    content = models.TextField()
    
    class Meta:
        db_table = 'question_contents'

class QuestionTag(TimestampMixin, SoftDeleteMixin):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='tags')
    tag = models.CharField(max_length=50, db_index=True)
    
    class Meta:
        db_table = 'question_tags'
        indexes = [
            models.Index(fields=['tag', 'is_active']),
        ]

class QuestionVote(TimestampMixin, SoftDeleteMixin):
    """Vote sur une question (upvote/downvote)"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='question_votes')
    vote_type = models.SmallIntegerField(choices=[(1, 'Upvote'), (-1, 'Downvote')], default=1)
    
    class Meta:
        db_table = 'question_votes'
        unique_together = ['question', 'user', 'is_active']

class QuestionView(TimestampMixin):
    """Compteur de vues"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'question_views'

class QuestionStatusHistory(TimestampMixin):
    """Historique résolu/non résolu"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='status_history')
    is_solved = models.BooleanField()
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'question_status_history'

class Answer(TimestampMixin, SoftDeleteMixin):
    """Réponse à une question"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='answers_profile')
    votes = models.IntegerField(default=0, db_index=True)
    is_accepted = models.BooleanField(default=False, db_index=True)
    
    class Meta:
        db_table = 'answers'
        verbose_name = 'Réponse'
        verbose_name_plural = 'Réponses'
        indexes = [
            models.Index(fields=['question', '-votes']),
            models.Index(fields=['author', 'is_active']),
        ]
        ordering = ['-is_accepted', '-votes', '-created_at']

class AnswerContent(TimestampMixin, VersionedFieldMixin):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='contents')
    content = models.TextField()
    
    class Meta:
        db_table = 'answer_contents'

class AnswerVote(TimestampMixin, SoftDeleteMixin):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='user_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answer_votes')
    vote_type = models.SmallIntegerField(choices=[(1, 'Upvote'), (-1, 'Downvote')], default=1)
    
    class Meta:
        db_table = 'answer_votes'
        unique_together = ['answer', 'user', 'is_active']

class AnswerAcceptance(TimestampMixin):
    """Historique acceptations de réponses"""
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='acceptances')
    accepted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'answer_acceptances'
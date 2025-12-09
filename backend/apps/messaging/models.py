# ============================================
# apps/messaging/models.py - Système Messagerie
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin
from apps.users.models import User

class Conversation(TimestampMixin, SoftDeleteMixin):
    """Conversation entre utilisateurs"""
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    class Meta:
        db_table = 'conversations'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-last_message_at']
    
    def __str__(self):
        participants = self.participants.filter(is_active=True)
        users = [p.user.email for p in participants[:3]]
        return f"Conversation: {', '.join(users)}"

class ConversationParticipant(TimestampMixin, SoftDeleteMixin):
    """Participants d'une conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversation_participations')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'conversation_participants'
        unique_together = ['conversation', 'user', 'is_active']
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]
    
    def get_unread_count(self):
        """Nombre de messages non lus"""
        if not self.last_read_at:
            return self.conversation.messages.filter(is_active=True).count()
        return self.conversation.messages.filter(
            is_active=True,
            created_at__gt=self.last_read_at
        ).exclude(sender=self.user).count()

class Message(TimestampMixin, SoftDeleteMixin):
    """Message dans une conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    is_encrypted = models.BooleanField(default=False)
    encrypted_keys = models.JSONField(default=dict, blank=True)
    is_visible_to_recipient = models.BooleanField(default=False, help_text="Visible seulement pendant un rendez-vous")
    
    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        content = self.contents.filter(is_current=True).first()
        return f"Message from {self.sender.email}: {content.content[:50] if content else ''}"

class MessageContent(TimestampMixin, VersionedFieldMixin):
    """Contenu du message (éditable)"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='contents')
    content = models.TextField()
    
    class Meta:
        db_table = 'message_contents'

class MessageReadStatus(TimestampMixin):
    """Statut de lecture par utilisateur"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_statuses')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reads')
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'message_read_statuses'
        unique_together = ['message', 'user']

class MessageAttachment(TimestampMixin, SoftDeleteMixin):
    """Pièces jointes (optionnel)"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file_url = models.URLField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()  # en bytes
    
    class Meta:
        db_table = 'message_attachments'


# ============================================
# apps/notifications/models.py - Système Notifications
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin
from apps.users.models import User

class Notification(TimestampMixin, SoftDeleteMixin):
    """Notification utilisateur"""
    TYPE_CHOICES = [
        ('SYSTEM', 'Système'),
        ('REPLY', 'Réponse'),
        ('MENTORSHIP', 'Mentorat'),
        ('ACHIEVEMENT', 'Succès'),
        ('MESSAGE', 'Message'),
        ('BOOKING', 'Réservation'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    link = models.CharField(max_length=255, null=True, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', 'is_read', 'is_active']),
            models.Index(fields=['user', '-created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        title = self.titles.filter(is_current=True).first()
        return f"{self.user.email}: {title.title if title else 'Notification'}"

class NotificationTitle(TimestampMixin, VersionedFieldMixin):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='titles')
    title = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'notification_titles'

class NotificationMessage(TimestampMixin, VersionedFieldMixin):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()
    
    class Meta:
        db_table = 'notification_messages'

class NotificationReadHistory(TimestampMixin):
    """Traçabilité des lectures"""
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='read_history')
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_read_history'
        
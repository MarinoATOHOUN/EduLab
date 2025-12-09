"""
==============================================
MODELS COMPLETS PART 2 - EDUCONNECT AFRICA API
==============================================
"""

# ============================================
# apps/gamification/models.py - Système Gamification
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin
from apps.users.models import User

class Badge(TimestampMixin, SoftDeleteMixin):
    """Badge déblocable"""
    code = models.SlugField(unique=True, max_length=50, db_index=True)
    
    class Meta:
        db_table = 'badges'
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
    
    def __str__(self):
        name = self.names.filter(is_current=True).first()
        return name.name if name else self.code

class BadgeName(TimestampMixin, VersionedFieldMixin):
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='names')
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'badge_names'

class BadgeDescription(TimestampMixin, VersionedFieldMixin):
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='descriptions')
    description = models.TextField()
    
    class Meta:
        db_table = 'badge_descriptions'

class BadgeIcon(TimestampMixin, VersionedFieldMixin):
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='icons')
    icon = models.CharField(max_length=100)  # Emoji ou path
    
    class Meta:
        db_table = 'badge_icons'

class BadgeColor(TimestampMixin, VersionedFieldMixin):
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='colors')
    color = models.CharField(max_length=50)  # CSS class ou hex
    
    class Meta:
        db_table = 'badge_colors'

class UserBadge(TimestampMixin, SoftDeleteMixin):
    """Attribution de badge à un utilisateur"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'user_badges'
        verbose_name = 'Badge Utilisateur'
        verbose_name_plural = 'Badges Utilisateurs'
        unique_together = ['user', 'badge', 'is_active']
        ordering = ['-awarded_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.badge.code}"

class BadgeCriteria(TimestampMixin, SoftDeleteMixin):
    """Règles d'attribution automatique"""
    CRITERIA_TYPES = [
        ('POINTS_THRESHOLD', 'Seuil de points'),
        ('FIRST_ACTION', 'Première action'),
        ('ACTION_COUNT', 'Nombre d\'actions'),
        ('STREAK', 'Série consécutive'),
    ]
    
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='criteria')
    criteria_type = models.CharField(max_length=50, choices=CRITERIA_TYPES)
    criteria_value = models.JSONField()  # Ex: {"points": 5000} ou {"action": "first_question"}
    
    class Meta:
        db_table = 'badge_criteria'
        verbose_name = 'Critère Badge'
        verbose_name_plural = 'Critères Badges'

class UserPointsHistory(TimestampMixin):
    """Historique complet des changements de points"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='points_history')
    points_change = models.IntegerField()
    previous_total = models.IntegerField()
    new_total = models.IntegerField()
    reason = models.CharField(max_length=255, db_index=True)
    related_content_type = models.CharField(max_length=50, null=True, blank=True)
    related_object_id = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_points_history'
        verbose_name = 'Historique Points'
        verbose_name_plural = 'Historiques Points'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['reason']),
        ]
        ordering = ['-created_at']

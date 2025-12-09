# ============================================
# apps/opportunities/models.py - Opportunités
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin
from apps.users.models import User

class Opportunity(TimestampMixin, SoftDeleteMixin):
    """Opportunité (bourse, stage, concours, formation)"""
    TYPE_CHOICES = [
        ('SCHOLARSHIP', 'Bourse'),
        ('CONTEST', 'Concours'),
        ('INTERNSHIP', 'Stage'),
        ('TRAINING', 'Formation'),
    ]
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    deadline = models.DateField(db_index=True)
    external_link = models.URLField(max_length=500)
    is_featured = models.BooleanField(default=False, db_index=True)
    views_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'opportunities'
        verbose_name = 'Opportunité'
        verbose_name_plural = 'Opportunités'
        indexes = [
            models.Index(fields=['type', 'deadline', 'is_active']),
            models.Index(fields=['-is_featured', '-created_at']),
        ]
        ordering = ['-is_featured', 'deadline']
    
    def __str__(self):
        title = self.titles.filter(is_current=True).first()
        return title.title if title else f"Opportunity #{self.id}"

class OpportunityTitle(TimestampMixin, VersionedFieldMixin):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='titles')
    title = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'opportunity_titles'

class OpportunityProvider(TimestampMixin, VersionedFieldMixin):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='providers')
    provider = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'opportunity_providers'

class OpportunityDescription(TimestampMixin, VersionedFieldMixin):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='descriptions')
    description = models.TextField()
    
    class Meta:
        db_table = 'opportunity_descriptions'

class OpportunityLocation(TimestampMixin, VersionedFieldMixin):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='locations')
    location = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'opportunity_locations'

class OpportunityImage(TimestampMixin, VersionedFieldMixin):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='opportunities/images/', null=True, blank=True)
    alt_text = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'opportunity_images'

class OpportunityTag(TimestampMixin, SoftDeleteMixin):
    """Tags pour filtrage"""
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='tags')
    tag = models.CharField(max_length=50, db_index=True)
    
    class Meta:
        db_table = 'opportunity_tags'
        unique_together = ['opportunity', 'tag', 'is_active']

class OpportunityView(TimestampMixin):
    """Compteur de vues"""
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'opportunity_views'


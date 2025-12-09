"""
==============================================
MODELS COMPLETS - EDUCONNECT AFRICA API
==============================================
"""

# ============================================
# apps/core/models.py - Mixins & Base Classes
# ============================================
from django.db import models
from django.utils import timezone

class TimestampMixin(models.Model):
    """Mixin pour timestamps automatiques"""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class SoftDeleteMixin(models.Model):
    """Mixin pour soft delete"""
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        abstract = True
    
    def delete(self, hard=False, **kwargs):
        if hard:
            super().delete(**kwargs)
        else:
            self.deleted_at = timezone.now()
            self.is_active = False
            self.save()
    
    def restore(self):
        self.deleted_at = None
        self.is_active = True
        self.save()

class VersionedFieldMixin(models.Model):
    """Mixin pour champs versionnés"""
    is_current = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        abstract = True

# Continuer dans le prochain message avec Gamification, Messaging, etc...

class ImpactStat(TimestampMixin):
    """Statistiques d'impact affichées sur la page d'accueil"""
    title = models.CharField(max_length=100, help_text="Ex: Étudiants formés")
    value = models.CharField(max_length=50, help_text="Ex: 5000+")
    icon = models.CharField(max_length=50, help_text="Nom de l'icône Lucide (ex: Users, GraduationCap)")
    description = models.TextField(blank=True, help_text="Description courte")
    order = models.IntegerField(default=0, help_text="Ordre d'affichage")
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'impact_stats'
        ordering = ['order']
        verbose_name = "Statistique d'impact"
        verbose_name_plural = "Statistiques d'impact"

    def __str__(self):
        return f"{self.title} ({self.value})"

class LearningTool(TimestampMixin):
    """Outils d'apprentissage pratiques (calculatrice, labo, etc.)"""
    CATEGORY_CHOICES = [
        ('Sciences', 'Sciences'),
        ('Créativité', 'Créativité'),
        ('Langues', 'Langues'),
        ('Informatique', 'Informatique'),
    ]
    LEVEL_CHOICES = [
        ('Primaire', 'Primaire'),
        ('Collège', 'Collège'),
        ('Lycée', 'Lycée'),
        ('Tous niveaux', 'Tous niveaux'),
    ]
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('dev', 'En développement'),
    ]

    tool_id = models.CharField(max_length=50, unique=True, help_text="Identifiant unique (ex: calc, chem)")
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Nom de l'icône Lucide")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    
    # Styling
    color = models.CharField(max_length=100, help_text="Classes Tailwind pour le fond de l'icône (ex: bg-blue-100)")
    text_color = models.CharField(max_length=100, help_text="Classes Tailwind pour la couleur de l'icône (ex: text-blue-600)")
    bg_gradient = models.CharField(max_length=100, help_text="Classes Tailwind pour le dégradé (ex: from-blue-500 to-cyan-400)")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    link = models.CharField(max_length=200, blank=True, help_text="Lien interne (ex: /tools/calculator) ou externe")
    order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'learning_tools'
        ordering = ['order']
        verbose_name = "Outil d'apprentissage"
        verbose_name_plural = "Outils d'apprentissage"

    def __str__(self):
        return self.title

class Testimonial(TimestampMixin):
    """Témoignages affichés sur la page d'accueil (L'impact EduLab)"""
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, help_text="Ex: Étudiante en Chimie")
    country = models.CharField(max_length=100, help_text="Ex: Sénégal")
    text = models.TextField(help_text="Le témoignage")
    avatar = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'testimonials'
        ordering = ['order']
        verbose_name = "Témoignage"
        verbose_name_plural = "Témoignages"

    def __str__(self):
        return f"{self.name} - {self.country}"

class SocialLink(TimestampMixin):
    """Liens vers les réseaux sociaux"""
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter (X)'),
        ('linkedin', 'LinkedIn'),
        ('instagram', 'Instagram'),
        ('youtube', 'YouTube'),
        ('email', 'Email'),
        ('website', 'Site Web'),
        ('other', 'Autre'),
    ]

    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    name = models.CharField(max_length=100, help_text="Nom affiché (ex: LinkedIn)")
    url = models.URLField(help_text="Lien complet (ex: https://linkedin.com/in/...)")
    icon = models.CharField(max_length=50, help_text="Nom de l'icône Lucide (ex: Linkedin, Twitter, Mail)")
    order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'social_links'
        ordering = ['order']
        verbose_name = "Lien social"
        verbose_name_plural = "Liens sociaux"

    def __str__(self):
        return f"{self.name} ({self.platform})"

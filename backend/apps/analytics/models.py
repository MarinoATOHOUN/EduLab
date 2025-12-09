# ============================================
# apps/analytics/models.py - Analytics & Search Tracking
# ============================================
from django.db import models
from apps.core.models import TimestampMixin
from apps.users.models import User

class SearchLog(TimestampMixin):
    """
    Enregistre chaque recherche effectuée sur la plateforme
    pour analyser les intérêts et comportements des utilisateurs
    """
    CATEGORY_CHOICES = [
        ('QUESTIONS', 'Questions du Forum'),
        ('MENTORS', 'Recherche de Mentors'),
        ('OPPORTUNITIES', 'Opportunités'),
        ('TOOLS', 'Outils Pédagogiques'),
        ('USERS', 'Utilisateurs'),
        ('GENERAL', 'Recherche Générale'),
    ]
    
    # Qui a effectué la recherche
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='search_logs',
        help_text="Utilisateur qui a effectué la recherche (null si anonyme)"
    )
    
    # Catégorie de la recherche
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES,
        db_index=True,
        help_text="Type de contenu recherché"
    )
    
    # Terme de recherche
    search_query = models.CharField(
        max_length=500,
        db_index=True,
        help_text="Texte saisi par l'utilisateur"
    )
    
    # Filtres appliqués (JSON pour flexibilité)
    filters_applied = models.JSONField(
        default=dict,
        blank=True,
        help_text="Filtres appliqués lors de la recherche (ex: {\"status\": \"solved\", \"tags\": [\"math\"]})"
    )
    
    # Résultats
    results_count = models.IntegerField(
        default=0,
        help_text="Nombre de résultats retournés"
    )
    
    # Métadonnées de session
    session_id = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text="ID de session pour regrouper les recherches d'une même visite"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Adresse IP de l'utilisateur"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="User agent du navigateur"
    )
    
    # Page d'origine
    page_url = models.CharField(
        max_length=500,
        blank=True,
        help_text="URL de la page où la recherche a été effectuée"
    )
    
    # Interaction
    clicked_result_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="ID du résultat cliqué (si applicable)"
    )
    
    clicked_result_position = models.IntegerField(
        null=True,
        blank=True,
        help_text="Position du résultat cliqué dans la liste"
    )
    
    class Meta:
        db_table = 'search_logs'
        verbose_name = 'Recherche'
        verbose_name_plural = 'Recherches'
        indexes = [
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['search_query']),
            models.Index(fields=['-created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        user_info = self.user.email if self.user else "Anonyme"
        return f"{user_info} - {self.category}: '{self.search_query}'"


class PopularSearch(models.Model):
    """
    Vue matérialisée des recherches les plus populaires
    Mise à jour périodiquement pour optimiser les performances
    """
    category = models.CharField(max_length=20, choices=SearchLog.CATEGORY_CHOICES)
    search_query = models.CharField(max_length=500)
    search_count = models.IntegerField(default=0)
    last_searched = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'popular_searches'
        verbose_name = 'Recherche Populaire'
        verbose_name_plural = 'Recherches Populaires'
        unique_together = ['category', 'search_query']
        ordering = ['-search_count', '-last_searched']
    
    def __str__(self):
        return f"{self.category}: '{self.search_query}' ({self.search_count}x)"

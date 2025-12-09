# ============================================
# apps/analytics/services.py - Search Tracking Service
# ============================================
from apps.analytics.models import SearchLog, PopularSearch
from django.db.models import F

class SearchTrackingService:
    """Service centralisé pour tracker les recherches"""
    
    @staticmethod
    def log_search(
        category: str,
        search_query: str,
        user=None,
        filters_applied: dict = None,
        results_count: int = 0,
        request=None
    ):
        """
        Enregistre une recherche dans les logs
        
        Args:
            category: Catégorie de recherche (QUESTIONS, MENTORS, etc.)
            search_query: Terme recherché
            user: Utilisateur qui effectue la recherche (None si anonyme)
            filters_applied: Dict des filtres appliqués
            results_count: Nombre de résultats retournés
            request: Objet request Django pour extraire métadonnées
        
        Returns:
            SearchLog instance
        """
        # Extraire métadonnées de la requête si disponible
        session_id = ''
        ip_address = None
        user_agent = ''
        page_url = ''
        
        if request:
            session_id = request.session.session_key or ''
            ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
            page_url = request.META.get('HTTP_REFERER', '')[:500]
        
        # Créer le log
        search_log = SearchLog.objects.create(
            user=user,
            category=category,
            search_query=search_query.strip()[:500],
            filters_applied=filters_applied or {},
            results_count=results_count,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            page_url=page_url
        )
        
        # Mettre à jour les recherches populaires
        SearchTrackingService._update_popular_search(category, search_query.strip())
        
        return search_log
    
    @staticmethod
    def _update_popular_search(category: str, search_query: str):
        """Mise à jour incrémentale des recherches populaires"""
        if not search_query or len(search_query) < 2:
            return
        
        popular, created = PopularSearch.objects.get_or_create(
            category=category,
            search_query=search_query[:500],
            defaults={'search_count': 1}
        )
        
        if not created:
            popular.search_count = F('search_count') + 1
            popular.save(update_fields=['search_count', 'last_searched'])
    
    @staticmethod
    def log_result_click(search_log_id: int, result_id: str, position: int):
        """
        Enregistre le clic sur un résultat de recherche
        
        Args:
            search_log_id: ID du SearchLog
            result_id: ID du résultat cliqué
            position: Position dans la liste (0-indexed)
        """
        try:
            search_log = SearchLog.objects.get(id=search_log_id)
            search_log.clicked_result_id = str(result_id)
            search_log.clicked_result_position = position
            search_log.save(update_fields=['clicked_result_id', 'clicked_result_position'])
        except SearchLog.DoesNotExist:
            pass
    
    @staticmethod
    def get_popular_searches(category: str = None, limit: int = 10):
        """
        Récupère les recherches les plus populaires
        
        Args:
            category: Filtrer par catégorie (None = toutes)
            limit: Nombre max de résultats
        
        Returns:
            QuerySet de PopularSearch
        """
        qs = PopularSearch.objects.all()
        
        if category:
            qs = qs.filter(category=category)
        
        return qs[:limit]
    
    @staticmethod
    def get_trending_searches(category: str = None, days: int = 7, limit: int = 10):
        """
        Récupère les recherches tendances (populaires récemment)
        
        Args:
            category: Filtrer par catégorie
            days: Nombre de jours à considérer
            limit: Nombre max de résultats
        
        Returns:
            Liste de dicts avec query et count
        """
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        
        since = timezone.now() - timedelta(days=days)
        
        qs = SearchLog.objects.filter(created_at__gte=since)
        
        if category:
            qs = qs.filter(category=category)
        
        trending = qs.values('search_query').annotate(
            count=Count('id')
        ).order_by('-count')[:limit]
        
        return list(trending)

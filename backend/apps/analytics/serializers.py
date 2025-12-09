# ============================================
# apps/analytics/serializers.py
# ============================================
from rest_framework import serializers
from apps.analytics.models import SearchLog, PopularSearch

class SearchLogSerializer(serializers.ModelSerializer):
    """Serializer pour enregistrer une recherche"""
    
    class Meta:
        model = SearchLog
        fields = [
            'id', 'category', 'search_query', 'filters_applied',
            'results_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PopularSearchSerializer(serializers.ModelSerializer):
    """Serializer pour les recherches populaires"""
    
    class Meta:
        model = PopularSearch
        fields = ['category', 'search_query', 'search_count', 'last_searched']

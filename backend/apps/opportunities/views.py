# ============================================
# apps/opportunities/views.py
# ============================================
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.opportunities.models import Opportunity, OpportunityView
from apps.opportunities.serializers import OpportunitySerializer

class OpportunityViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste des opportunités"""
    permission_classes = [IsAuthenticated]
    queryset = Opportunity.objects.filter(is_active=True)
    serializer_class = OpportunitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'is_featured']
    search_fields = ['titles__title', 'descriptions__description', 'providers__provider']
    ordering_fields = ['deadline', 'created_at', 'views_count']
    ordering = ['deadline']
    
    def retrieve(self, request, *args, **kwargs):
        """Incrémenter les vues"""
        instance = self.get_object()
        
        # Enregistrer la vue
        OpportunityView.objects.create(
            opportunity=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Incrémenter compteur
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


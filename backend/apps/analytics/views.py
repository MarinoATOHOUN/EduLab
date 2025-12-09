# ============================================
# apps/analytics/views.py
# ============================================
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.analytics.services import SearchTrackingService
from apps.analytics.serializers import SearchLogSerializer, PopularSearchSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def log_search(request):
    """
    Enregistrer une recherche
    POST /api/analytics/search-log/
    
    Body:
    {
        "category": "QUESTIONS",
        "search_query": "python",
        "filters_applied": {"status": "unsolved"},
        "results_count": 15
    }
    """
    serializer = SearchLogSerializer(data=request.data)
    
    if serializer.is_valid():
        user = request.user if request.user.is_authenticated else None
        
        search_log = SearchTrackingService.log_search(
            category=serializer.validated_data['category'],
            search_query=serializer.validated_data['search_query'],
            user=user,
            filters_applied=serializer.validated_data.get('filters_applied', {}),
            results_count=serializer.validated_data.get('results_count', 0),
            request=request
        )
        
        return Response(
            SearchLogSerializer(search_log).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def log_result_click(request):
    """
    Enregistrer le clic sur un résultat
    POST /api/analytics/result-click/
    
    Body:
    {
        "search_log_id": 123,
        "result_id": "456",
        "position": 2
    }
    """
    search_log_id = request.data.get('search_log_id')
    result_id = request.data.get('result_id')
    position = request.data.get('position')
    
    if not all([search_log_id, result_id, position is not None]):
        return Response(
            {'error': 'Missing required fields'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    SearchTrackingService.log_result_click(
        search_log_id=search_log_id,
        result_id=result_id,
        position=position
    )
    
    return Response({'status': 'success'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def popular_searches(request):
    """
    Récupérer les recherches populaires
    GET /api/analytics/popular-searches/?category=QUESTIONS&limit=10
    """
    category = request.query_params.get('category')
    limit = int(request.query_params.get('limit', 10))
    
    searches = SearchTrackingService.get_popular_searches(
        category=category,
        limit=min(limit, 50)  # Max 50
    )
    
    serializer = PopularSearchSerializer(searches, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def trending_searches(request):
    """
    Récupérer les recherches tendances
    GET /api/analytics/trending-searches/?category=QUESTIONS&days=7&limit=10
    """
    category = request.query_params.get('category')
    days = int(request.query_params.get('days', 7))
    limit = int(request.query_params.get('limit', 10))
    
    trending = SearchTrackingService.get_trending_searches(
        category=category,
        days=min(days, 30),  # Max 30 jours
        limit=min(limit, 50)
    )
    
    return Response(trending)

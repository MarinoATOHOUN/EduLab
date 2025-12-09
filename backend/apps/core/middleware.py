# ============================================
# apps/core/middleware.py (Optionnel)
# ============================================
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

class ActivityTrackingMiddleware:
    """Middleware pour tracker l'activité utilisateur"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Logger l'activité si utilisateur authentifié
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            from apps.analytics.models import UserActivity
            
            try:
                UserActivity.objects.create(
                    user=request.user,
                    activity_type=f"{request.method}_{request.path}",
                    activity_data={
                        'path': request.path,
                        'method': request.method,
                        'status_code': response.status_code
                    },
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                )
            except Exception as e:
                logger.error(f"Error tracking activity: {e}")
        
        return response


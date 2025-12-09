"""
==============================================
URLS - EDUCONNECT AFRICA API
==============================================
"""

# ============================================
# educonnect_api/urls.py - URL Root
# ============================================
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API Endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/mentors/', include('apps.mentors.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/forum/', include('apps.forum.urls')),
    path('api/gamification/', include('apps.gamification.urls')),
    path('api/conversations/', include('apps.messaging.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/opportunities/', include('apps.opportunities.urls')),
    path('api/ai/', include('apps.ai_tools.urls')),
    path('api/', include('apps.core.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


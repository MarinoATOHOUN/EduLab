# ============================================
# apps/notifications/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.notifications.views import NotificationViewSet

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- GET /api/notifications/ (liste)
- GET /api/notifications/{id}/
- POST /api/notifications/mark_all_read/
- POST /api/notifications/{id}/mark_read/
- DELETE /api/notifications/{id}/delete_notification/
- GET /api/notifications/unread_count/
"""


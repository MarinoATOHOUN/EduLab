# ============================================
# apps/messaging/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.messaging.views import ConversationViewSet

router = DefaultRouter()
router.register(r'', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- GET /api/messages/conversations/ (liste)
- POST /api/messages/conversations/ (créer)
- GET /api/messages/conversations/{id}/
- GET /api/messages/conversations/{id}/messages/
- POST /api/messages/conversations/{id}/send_message/
"""


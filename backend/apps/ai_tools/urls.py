# ============================================
# apps/ai_tools/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.ai_tools.views import AIToolsViewSet

router = DefaultRouter()
router.register(r'', AIToolsViewSet, basename='ai_tools')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- POST /api/ai/tutor/
"""
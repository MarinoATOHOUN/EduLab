# ============================================
# apps/gamification/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.gamification.views import GamificationViewSet

router = DefaultRouter()
router.register(r'', GamificationViewSet, basename='gamification')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- GET /api/gamification/leaderboard/
- GET /api/gamification/my_badges/
- GET /api/gamification/all_badges/
- GET /api/gamification/points_history/
- GET /api/gamification/stats/
"""


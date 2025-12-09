# ============================================
# apps/mentors/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.mentors.views import MentorViewSet

router = DefaultRouter()
router.register(r'', MentorViewSet, basename='mentor')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- GET /api/mentors/ (liste avec filtres)
- GET /api/mentors/{id}/ (détail)
- GET /api/mentors/my_profile/
- PATCH /api/mentors/my_profile/
- GET /api/mentors/{id}/reviews/
"""


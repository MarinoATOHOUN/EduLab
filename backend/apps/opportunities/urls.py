# ============================================
# apps/opportunities/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.opportunities.views import OpportunityViewSet

router = DefaultRouter()
router.register(r'', OpportunityViewSet, basename='opportunity')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- GET /api/opportunities/ (liste avec filtres)
- GET /api/opportunities/{id}/
"""

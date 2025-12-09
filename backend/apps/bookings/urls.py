# ============================================
# apps/bookings/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.bookings.views import BookingViewSet

router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- GET /api/bookings/ (mes réservations)
- POST /api/bookings/ (créer)
- GET /api/bookings/{id}/
- PATCH /api/bookings/{id}/update_status/
- GET /api/bookings/mentor_requests/
"""


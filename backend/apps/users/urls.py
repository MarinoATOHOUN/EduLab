# ============================================
# apps/users/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import AuthViewSet

router = DefaultRouter()
router.register(r'', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

"""
Endpoints disponibles:
- POST /api/auth/register/
- POST /api/auth/login/
- GET /api/auth/me/
- PATCH /api/auth/update_profile/
- POST /api/auth/token/refresh/
"""


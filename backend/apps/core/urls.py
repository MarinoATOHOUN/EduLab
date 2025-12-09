from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.core import views

router = DefaultRouter()
router.register(r'impact-stats', views.ImpactStatViewSet)
router.register(r'learning-tools', views.LearningToolViewSet)
router.register(r'testimonials', views.TestimonialViewSet)
router.register(r'social-links', views.SocialLinkViewSet)

urlpatterns = [
    path('stats/', views.platform_stats, name='platform-stats'),
    path('', include(router.urls)),
]

# ============================================
# apps/forum/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.forum.views import QuestionViewSet, AnswerViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'answers', AnswerViewSet, basename='answer')

urlpatterns = [
    path('', include(router.urls)),
]

"""
Endpoints disponibles:
- GET /api/forum/questions/ (liste)
- POST /api/forum/questions/ (créer)
- GET /api/forum/questions/{id}/
- PATCH /api/forum/questions/{id}/ (modifier)
- DELETE /api/forum/questions/{id}/ (soft delete)
- POST /api/forum/questions/{id}/vote/
- GET /api/forum/questions/{id}/answers/
- POST /api/forum/questions/{id}/answers/ (créer réponse)
- POST /api/forum/answers/{id}/vote/
- POST /api/forum/answers/{id}/accept/
"""



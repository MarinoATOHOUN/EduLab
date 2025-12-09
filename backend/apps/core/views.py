# ============================================
# apps/core/views.py - Stats & Health Check
# ============================================
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from apps.users.models import User
from apps.forum.models import Question
from apps.mentors.models import MentorProfile

@api_view(['GET'])
@permission_classes([AllowAny])
def platform_stats(request):
    """
    Endpoint public pour récupérer les statistiques de la plateforme
    GET /api/stats/
    """
    
    # Nombre d'étudiants actifs (utilisateurs avec rôle STUDENT)
    active_students = User.objects.filter(
        role='STUDENT',
        is_active=True
    ).count()
    
    # Nombre de questions résolues (is_solved=True)
    solved_questions = Question.objects.filter(
        is_solved=True,
        is_active=True
    ).count()
    
    # Nombre de mentors experts (profils mentor actifs et vérifiés)
    expert_mentors = MentorProfile.objects.filter(
        is_active=True,
        is_verified=True
    ).count()
    
    # Si pas de mentors vérifiés, compter tous les mentors actifs
    if expert_mentors == 0:
        expert_mentors = MentorProfile.objects.filter(is_active=True).count()
    
    # Nombre d'outils pratiques (hardcodé pour l'instant car pas en DB)
    # Calculatrice, Atlas, Écriture, Coloriage, Code Sandbox, AI Tutor, etc.
    practical_tools = 15
    
    return Response({
        'active_students': active_students,
        'solved_questions': solved_questions,
        'expert_mentors': expert_mentors,
        'practical_tools': practical_tools
    })

from .models import ImpactStat, LearningTool, Testimonial, SocialLink
from .serializers import ImpactStatSerializer, LearningToolSerializer, TestimonialSerializer, SocialLinkSerializer

class ImpactStatViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint pour récupérer les statistiques d'impact configurables.
    """
    queryset = ImpactStat.objects.filter(is_visible=True).order_by('order')
    serializer_class = ImpactStatSerializer
    permission_classes = [AllowAny]

class LearningToolViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint pour récupérer les outils d'apprentissage.
    """
    queryset = LearningTool.objects.filter(is_visible=True).order_by('order')
    serializer_class = LearningToolSerializer
    permission_classes = [AllowAny]

class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint pour récupérer les témoignages.
    """
    queryset = Testimonial.objects.filter(is_visible=True).order_by('order')
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

class SocialLinkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint pour récupérer les liens sociaux.
    """
    queryset = SocialLink.objects.filter(is_visible=True).order_by('order')
    serializer_class = SocialLinkSerializer
    permission_classes = [AllowAny]

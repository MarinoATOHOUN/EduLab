"""
==============================================
VIEWS PART 2 - GAMIFICATION, MESSAGING, etc.
==============================================
"""

# ============================================
# apps/gamification/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Window, F
from django.db.models.functions import RowNumber

from apps.gamification.models import Badge, UserBadge, UserPointsHistory
from apps.gamification.serializers import (
    BadgeSerializer, UserBadgeSerializer, LeaderboardUserSerializer,
    UserPointsHistorySerializer
)
from apps.users.models import User

class GamificationViewSet(viewsets.GenericViewSet):
    """Endpoints gamification"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """GET /api/gamification/leaderboard/"""
        # Limiter aux utilisateurs actifs avec points
        users = User.objects.filter(
            is_active=True,
            points__gt=0
        ).order_by('-points')
        
        # Ajouter le rang
        users = users.annotate(
            rank=Window(
                expression=RowNumber(),
                order_by=F('points').desc()
            )
        )
        
        # Paramètres de pagination
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        
        # Appliquer pagination
        paginated_users = users[offset:offset + limit]
        
        serializer = LeaderboardUserSerializer(paginated_users, many=True)
        return Response({
            'count': users.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def my_badges(self, request):
        """GET /api/gamification/my_badges/"""
        user_badges = request.user.user_badges.filter(is_active=True).order_by('-awarded_at')
        serializer = UserBadgeSerializer(user_badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_badges(self, request):
        """GET /api/gamification/all_badges/"""
        badges = Badge.objects.filter(is_active=True)
        serializer = BadgeSerializer(badges, many=True)
        
        # Ajouter info si l'utilisateur possède le badge
        user_badge_codes = set(
            request.user.user_badges.filter(is_active=True)
            .values_list('badge__code', flat=True)
        )
        
        data = serializer.data
        for badge in data:
            badge['earned'] = badge['code'] in user_badge_codes
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def points_history(self, request):
        """GET /api/gamification/points_history/"""
        history = request.user.points_history.order_by('-created_at')
        
        # Pagination
        page = self.paginate_queryset(history)
        if page is not None:
            serializer = UserPointsHistorySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = UserPointsHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """GET /api/gamification/stats/ - Statistiques de l'utilisateur"""
        user = request.user
        
        # Rang global
        rank = User.objects.filter(
            is_active=True,
            points__gt=user.points
        ).count() + 1
        
        # Total utilisateurs
        total_users = User.objects.filter(is_active=True).count()
        
        # Badges
        badges_earned = user.user_badges.filter(is_active=True).count()
        total_badges = Badge.objects.filter(is_active=True).count()
        
        # Calcul du niveau (1000 points par niveau)
        points_per_level = 1000
        level = (user.points // points_per_level) + 1
        
        return Response({
            'points': user.points,
            'level': level,
            'rank': rank,
            'total_users': total_users,
            'earned_badges': badges_earned,
            'total_badges': total_badges,
            'percentile': round((1 - (rank / total_users)) * 100, 2) if total_users > 0 else 0
        })



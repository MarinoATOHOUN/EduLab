"""
==============================================
VIEWS COMPLETS - EDUCONNECT AFRICA API
==============================================
"""

# ============================================
# apps/users/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid

from apps.users.models import User, UserAvatar
from apps.users.serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    UserProfileUpdateSerializer
)

class AuthViewSet(viewsets.GenericViewSet):
    """Gestion de l'authentification"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """POST /api/auth/register/"""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Générer tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """POST /api/auth/login/"""
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Générer tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Mettre à jour last_login
        from django.utils import timezone
        user.last_login = timezone.now()
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save(update_fields=['last_login', 'last_login_ip'])
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """GET /api/auth/me/"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated], url_path='profile')
    def update_profile(self, request):
        """PATCH /api/auth/profile/"""
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if not serializer.is_valid():
            import logging
            logger = logging.getLogger('django')
            logger.warning(f"Bad Request: {request.path}")
            logger.warning(f"Validation errors: {serializer.errors}")
            serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(UserSerializer(request.user).data)
    
    @action(
        detail=False, 
        methods=['post'], 
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        url_path='upload-avatar'
    )
    def upload_avatar(self, request):
        """POST /api/auth/upload-avatar/ - Upload avatar image"""
        if 'avatar' not in request.FILES:
            return Response(
                {'error': 'No avatar file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        avatar_file = request.FILES['avatar']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = os.path.splitext(avatar_file.name)[1]
            filename = f"avatars/{request.user.id}/{uuid.uuid4()}{ext}"
            
            # Save file
            path = default_storage.save(filename, ContentFile(avatar_file.read()))
            avatar_url = default_storage.url(path)
            
            # Get user profile (handle multiple profiles case)
            from apps.users.models import UserProfile
            profile = UserProfile.objects.filter(user=request.user, is_current=True).first()
            
            # If no current profile exists, create one
            if not profile:
                profile = UserProfile.objects.create(
                    user=request.user,
                    name=request.user.name
                )
            
            # Deactivate old avatars
            profile.avatars.filter(is_current=True).update(is_current=False)
            
            # Create new avatar record
            UserAvatar.objects.create(
                profile=profile,
                avatar_url=avatar_url
            )
            
            return Response({
                'avatar_url': avatar_url,
                'message': 'Avatar uploaded successfully'
            })
            
        except Exception as e:
            import logging
            logger = logging.getLogger('django')
            logger.error(f"Avatar upload error: {str(e)}")
            return Response(
                {'error': 'Failed to upload avatar'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

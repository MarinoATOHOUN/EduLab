# ============================================
# apps/core/permissions.py
# ============================================
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission: lecture pour tous, écriture uniquement pour le propriétaire"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Vérifier si l'objet a un attribut 'author' ou 'user'
        if hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'student'):
            return obj.student == request.user or obj.mentor == request.user
        
        return False

class IsMentorOrReadOnly(permissions.BasePermission):
    """Permission: uniquement les mentors peuvent modifier"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.role == 'MENTOR'

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission: lecture pour tous, écriture uniquement pour les admins"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_staff or request.user.role == 'ADMIN'


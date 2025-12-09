# ============================================
# apps/notifications/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.notifications.models import Notification, NotificationReadHistory
from apps.notifications.serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Gestion des notifications"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        queryset = Notification.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('-created_at')
        
        # Filtre lu/non lu
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """POST /api/notifications/mark_all_read/"""
        notifications = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_active=True
        )
        
        for notif in notifications:
            notif.is_read = True
            notif.save(update_fields=['is_read'])
            
            # Historiser
            NotificationReadHistory.objects.create(notification=notif)
        
        return Response({'message': f'{notifications.count()} notifications marquées comme lues'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """POST /api/notifications/{id}/mark_read/"""
        notification = self.get_object()
        
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=['is_read'])
            NotificationReadHistory.objects.create(notification=notification)
        
        return Response({'message': 'Notification marquée comme lue'})
    
    @action(detail=True, methods=['delete'])
    def delete_notification(self, request, pk=None):
        """DELETE /api/notifications/{id}/delete_notification/"""
        notification = self.get_object()
        notification.delete()  # Soft delete
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """GET /api/notifications/unread_count/"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_active=True
        ).count()
        
        return Response({'count': count})


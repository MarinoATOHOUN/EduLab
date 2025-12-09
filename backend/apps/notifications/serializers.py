# ============================================
# apps/notifications/serializers.py
# ============================================
from rest_framework import serializers
from apps.notifications.models import Notification

from apps.core.serializers import HashIdField

class NotificationSerializer(serializers.ModelSerializer):
    user_id = HashIdField(source_field='user.id', read_only=True)
    title = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()
    type_label = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user_id', 'type', 'type_label', 'title', 'message',
            'link', 'is_read', 'created_at'
        ]
    
    def get_title(self, obj):
        title = obj.titles.filter(is_current=True).first()
        return title.title if title else None
    
    def get_message(self, obj):
        msg = obj.messages.filter(is_current=True).first()
        return msg.message if msg else None


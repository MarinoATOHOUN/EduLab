# ============================================
# apps/gamification/serializers.py
# ============================================
from rest_framework import serializers
from apps.gamification.models import Badge, UserBadge, UserPointsHistory
from apps.users.models import User
from apps.users.serializers import UserSerializer

class BadgeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    
    class Meta:
        model = Badge
        fields = ['id', 'code', 'name', 'description', 'icon', 'color']
    
    def get_name(self, obj):
        name = obj.names.filter(is_current=True).first()
        return name.name if name else obj.code
    
    def get_description(self, obj):
        desc = obj.descriptions.filter(is_current=True).first()
        return desc.description if desc else None
    
    def get_icon(self, obj):
        icon = obj.icons.filter(is_current=True).first()
        return icon.icon if icon else None
    
    def get_color(self, obj):
        color = obj.colors.filter(is_current=True).first()
        return color.color if color else None

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'awarded_at']

class LeaderboardUserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    rank = serializers.IntegerField(read_only=True)
    badges_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'profile', 'points', 'rank', 'badges_count']
    
    def get_profile(self, obj):
        from apps.users.serializers import UserProfileDetailSerializer
        profile = obj.profiles.filter(is_current=True).first()
        return UserProfileDetailSerializer(profile).data if profile else None
    
    def get_badges_count(self, obj):
        return obj.user_badges.filter(is_active=True).count()

class UserPointsHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPointsHistory
        fields = [
            'id', 'points_change', 'previous_total', 'new_total',
            'reason', 'created_at'
        ]


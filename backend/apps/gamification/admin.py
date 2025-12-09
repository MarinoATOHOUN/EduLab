from django.contrib import admin
from .models import (
    Badge, BadgeName, BadgeDescription, BadgeIcon, BadgeColor,
    UserBadge, BadgeCriteria, UserPointsHistory
)

class BadgeNameInline(admin.StackedInline):
    model = BadgeName
    extra = 0

class BadgeDescriptionInline(admin.StackedInline):
    model = BadgeDescription
    extra = 0

class BadgeIconInline(admin.StackedInline):
    model = BadgeIcon
    extra = 0

class BadgeColorInline(admin.StackedInline):
    model = BadgeColor
    extra = 0

class BadgeCriteriaInline(admin.StackedInline):
    model = BadgeCriteria
    extra = 0

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('code', 'created_at', 'is_active')
    search_fields = ('code',)
    inlines = [BadgeNameInline, BadgeDescriptionInline, BadgeIconInline, BadgeColorInline, BadgeCriteriaInline]

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at', 'is_active')
    list_filter = ('badge', 'awarded_at')
    search_fields = ('user__email', 'badge__code')

@admin.register(UserPointsHistory)
class UserPointsHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'points_change', 'new_total', 'reason', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('user__email', 'reason')

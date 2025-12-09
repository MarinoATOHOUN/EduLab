from django.contrib import admin
from .models import (
    Notification, NotificationTitle, NotificationMessage, NotificationReadHistory
)

class NotificationTitleInline(admin.StackedInline):
    model = NotificationTitle
    extra = 0

class NotificationMessageInline(admin.StackedInline):
    model = NotificationMessage
    extra = 0

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__email', 'type')
    inlines = [NotificationTitleInline, NotificationMessageInline]

@admin.register(NotificationReadHistory)
class NotificationReadHistoryAdmin(admin.ModelAdmin):
    list_display = ('notification', 'read_at')
    list_filter = ('read_at',)

from django.contrib import admin
from .models import (
    Conversation, ConversationParticipant, Message, 
    MessageContent, MessageReadStatus, MessageAttachment
)

class ConversationParticipantInline(admin.TabularInline):
    model = ConversationParticipant
    extra = 0

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'last_message_at', 'created_at', 'is_active')
    list_filter = ('created_at', 'is_active')
    inlines = [ConversationParticipantInline]

class MessageContentInline(admin.StackedInline):
    model = MessageContent
    extra = 0

class MessageAttachmentInline(admin.TabularInline):
    model = MessageAttachment
    extra = 0

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'conversation', 'created_at', 'is_active')
    list_filter = ('created_at', 'is_active')
    search_fields = ('sender__email',)
    inlines = [MessageContentInline, MessageAttachmentInline]

@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ('message', 'user', 'read_at')
    list_filter = ('read_at',)

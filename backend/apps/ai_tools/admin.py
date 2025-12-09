from django.contrib import admin
from .models import AITutorSession, AITutorQuestion, CodeSnippet

class AITutorQuestionInline(admin.StackedInline):
    model = AITutorQuestion
    extra = 0

@admin.register(AITutorSession)
class AITutorSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'subject', 'level', 'total_questions', 'created_at')
    list_filter = ('subject', 'level', 'created_at')
    search_fields = ('user__email', 'subject')
    inlines = [AITutorQuestionInline]

@admin.register(CodeSnippet)
class CodeSnippetAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'language', 'is_public', 'created_at')
    list_filter = ('language', 'is_public', 'created_at')
    search_fields = ('user__email', 'title', 'code')

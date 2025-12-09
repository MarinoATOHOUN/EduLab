from django.contrib import admin
from .models import (
    Question, QuestionTitle, QuestionContent, QuestionTag, 
    QuestionVote, QuestionView, QuestionStatusHistory,
    Answer, AnswerContent, AnswerVote, AnswerAcceptance
)

class QuestionTitleInline(admin.StackedInline):
    model = QuestionTitle
    extra = 0

class QuestionContentInline(admin.StackedInline):
    model = QuestionContent
    extra = 0

class QuestionTagInline(admin.TabularInline):
    model = QuestionTag
    extra = 0

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'votes', 'is_solved', 'views_count', 'created_at')
    list_filter = ('is_solved', 'created_at', 'is_active')
    search_fields = ('author__email',)
    inlines = [QuestionTitleInline, QuestionContentInline, QuestionTagInline]

class AnswerContentInline(admin.StackedInline):
    model = AnswerContent
    extra = 0

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'author', 'votes', 'is_accepted', 'created_at')
    list_filter = ('is_accepted', 'created_at', 'is_active')
    search_fields = ('author__email', 'question__id')
    inlines = [AnswerContentInline]

@admin.register(QuestionVote)
class QuestionVoteAdmin(admin.ModelAdmin):
    list_display = ('question', 'user', 'vote_type', 'is_active', 'created_at')
    list_filter = ('vote_type', 'is_active')

@admin.register(AnswerVote)
class AnswerVoteAdmin(admin.ModelAdmin):
    list_display = ('answer', 'user', 'vote_type', 'is_active', 'created_at')
    list_filter = ('vote_type', 'is_active')

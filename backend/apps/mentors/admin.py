from django.contrib import admin
from .models import (
    MentorProfile, MentorBio, MentorSpecialty, MentorAvailability,
    MentorSocial, MentorReview, MentorReviewComment
)

class MentorBioInline(admin.StackedInline):
    model = MentorBio
    extra = 0

class MentorSpecialtyInline(admin.TabularInline):
    model = MentorSpecialty
    extra = 0

class MentorSocialInline(admin.TabularInline):
    model = MentorSocial
    extra = 0

@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'reviews_count', 'is_verified', 'total_sessions', 'is_active')
    list_filter = ('is_verified', 'is_active', 'created_at')
    search_fields = ('user__email',)
    inlines = [MentorBioInline, MentorSpecialtyInline, MentorSocialInline]

@admin.register(MentorAvailability)
class MentorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('mentor_profile', 'day_of_week', 'start_time', 'end_time', 'is_active')
    list_filter = ('day_of_week', 'is_active')

@admin.register(MentorReview)
class MentorReviewAdmin(admin.ModelAdmin):
    list_display = ('mentor_profile', 'student', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('mentor_profile__user__email', 'student__email')

@admin.register(MentorReviewComment)
class MentorReviewCommentAdmin(admin.ModelAdmin):
    list_display = ('review', 'created_at')

from django.utils.html import format_html
from .models import MentorApplication

@admin.register(MentorApplication)
class MentorApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status_badge', 'ai_status_badge', 'ai_validated', 'ai_score', 'university', 'created_at', 'cv_link', 'id_card_link')
    list_filter = ('status', 'ai_status', 'ai_validated', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'university')
    readonly_fields = ('created_at', 'updated_at', 'ai_status', 'ai_recommendation', 'ai_score', 'ai_validated')
    
    fieldsets = (
        ('Informations Utilisateur', {
            'fields': ('user', 'university', 'bio', 'specialties', 'availability')
        }),
        ('Documents', {
            'fields': ('cv_file', 'id_card_photo')
        }),
        ('Réseaux Sociaux', {
            'fields': ('linkedin', 'twitter', 'website')
        }),
        ('Analyse IA (Automatique)', {
            'fields': ('ai_status', 'ai_validated', 'ai_score', 'ai_recommendation'),
            'description': 'Ces champs sont remplis automatiquement par l\'IA Gemini après la soumission.'
        }),
        ('Décision Admin', {
            'fields': ('status', 'created_at', 'updated_at')
        }),
    )

    def status_badge(self, obj):
        colors = {
            'PENDING': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red',
        }
        return format_html(
            '<span style="color: white; background-color: {}; padding: 3px 10px; border-radius: 10px; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'gray'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Statut'

    def ai_status_badge(self, obj):
        colors = {
            'PENDING': '#6b7280',    # gray-500
            'PROCESSING': '#3b82f6', # blue-500
            'COMPLETED': '#10b981',  # emerald-500
            'FAILED': '#ef4444',     # red-500
        }
        return format_html(
            '<span style="color: white; background-color: {}; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 500;">{}</span>',
            colors.get(obj.ai_status, 'gray'),
            obj.get_ai_status_display()
        )
    ai_status_badge.short_description = 'Analyse IA'

    def cv_link(self, obj):
        if obj.cv_file:
            return format_html('<a href="{}" target="_blank" style="background-color: #3b82f6; color: white; padding: 3px 8px; border-radius: 4px; text-decoration: none; font-size: 11px;">Voir CV</a>', obj.cv_file.url)
        return "-"
    cv_link.short_description = 'CV'

    def id_card_link(self, obj):
        if obj.id_card_photo:
            return format_html('<a href="{}" target="_blank" style="background-color: #8b5cf6; color: white; padding: 3px 8px; border-radius: 4px; text-decoration: none; font-size: 11px;">Voir ID</a>', obj.id_card_photo.url)
        return "-"
    id_card_link.short_description = 'Photo ID'

    actions = ['approve_applications', 'reject_applications', 'retry_ai_review']

    @admin.action(description='Approuver les candidatures sélectionnées')
    def approve_applications(self, request, queryset):
        updated = queryset.update(status='APPROVED')
        self.message_user(request, f"{updated} candidature(s) approuvée(s).")

    @admin.action(description='Rejeter les candidatures sélectionnées')
    def reject_applications(self, request, queryset):
        updated = queryset.update(status='REJECTED')
        self.message_user(request, f"{updated} candidature(s) rejetée(s).")

    @admin.action(description='Relancer l\'analyse IA')
    def retry_ai_review(self, request, queryset):
        from .services import MentorAIRewiewService
        import threading
        for instance in queryset:
            thread = threading.Thread(
                target=MentorAIRewiewService.review_application,
                args=(instance.id,)
            )
            thread.start()
        self.message_user(request, f"Analyse IA relancée pour {queryset.count()} candidature(s).")


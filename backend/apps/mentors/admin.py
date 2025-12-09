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
    list_display = ('user', 'status_badge', 'university', 'created_at', 'cv_link')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'university')
    readonly_fields = ('created_at', 'updated_at')
    
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

    def cv_link(self, obj):
        if obj.cv_file:
            return format_html('<a href="{}" target="_blank" style="background-color: #3b82f6; color: white; padding: 3px 8px; border-radius: 4px; text-decoration: none;">Voir le CV</a>', obj.cv_file.url)
        return "-"
    cv_link.short_description = 'CV'

    actions = ['approve_applications', 'reject_applications']

    @admin.action(description='Approuver les candidatures sélectionnées')
    def approve_applications(self, request, queryset):
        updated = queryset.update(status='APPROVED')
        self.message_user(request, f"{updated} candidature(s) approuvée(s).")

    @admin.action(description='Rejeter les candidatures sélectionnées')
    def reject_applications(self, request, queryset):
        updated = queryset.update(status='REJECTED')
        self.message_user(request, f"{updated} candidature(s) rejetée(s).")


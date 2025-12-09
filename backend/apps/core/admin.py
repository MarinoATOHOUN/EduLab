from django.contrib import admin
from .models import ImpactStat, LearningTool, Testimonial, SocialLink

@admin.register(ImpactStat)
class ImpactStatAdmin(admin.ModelAdmin):
    list_display = ('title', 'value', 'icon', 'order', 'is_visible')
    list_editable = ('order', 'is_visible')
    search_fields = ('title', 'description')

@admin.register(LearningTool)
class LearningToolAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'status', 'order', 'is_visible')
    list_editable = ('status', 'order', 'is_visible')
    list_filter = ('category', 'level', 'status')
    search_fields = ('title', 'description')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'country', 'order', 'is_visible')
    list_editable = ('order', 'is_visible')
    search_fields = ('name', 'text', 'country')

@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('name', 'platform', 'url', 'order', 'is_visible')
    list_editable = ('order', 'is_visible')
    list_filter = ('platform',)

from django.contrib import admin
from .models import (
    Opportunity, OpportunityTitle, OpportunityProvider, 
    OpportunityDescription, OpportunityLocation, OpportunityImage, 
    OpportunityTag, OpportunityView
)

class OpportunityTitleInline(admin.StackedInline):
    model = OpportunityTitle
    extra = 0

class OpportunityProviderInline(admin.StackedInline):
    model = OpportunityProvider
    extra = 0

class OpportunityDescriptionInline(admin.StackedInline):
    model = OpportunityDescription
    extra = 0

class OpportunityLocationInline(admin.StackedInline):
    model = OpportunityLocation
    extra = 0

class OpportunityImageInline(admin.StackedInline):
    model = OpportunityImage
    extra = 0

class OpportunityTagInline(admin.TabularInline):
    model = OpportunityTag
    extra = 0

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'deadline', 'is_featured', 'views_count', 'created_at')
    list_filter = ('type', 'is_featured', 'deadline', 'created_at')
    search_fields = ('type', 'external_link')
    inlines = [
        OpportunityTitleInline, OpportunityProviderInline, 
        OpportunityDescriptionInline, OpportunityLocationInline, 
        OpportunityImageInline, OpportunityTagInline
    ]

from django.contrib import admin
from apps.analytics.models import SearchLog, PopularSearch

@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'category', 'search_query', 'results_count', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['search_query', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Recherche', {
            'fields': ('user', 'category', 'search_query', 'filters_applied', 'results_count')
        }),
        ('Interaction', {
            'fields': ('clicked_result_id', 'clicked_result_position')
        }),
        ('Métadonnées', {
            'fields': ('session_id', 'ip_address', 'user_agent', 'page_url'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PopularSearch)
class PopularSearchAdmin(admin.ModelAdmin):
    list_display = ['search_query', 'category', 'search_count', 'last_searched']
    list_filter = ['category']
    search_fields = ['search_query']
    ordering = ['-search_count', '-last_searched']

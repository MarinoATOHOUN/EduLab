from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserAvatar, UserCountry, UserUniversity

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'role', 'points', 'is_staff', 'is_active', 'created_at')
    list_filter = ('role', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email',)
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('role', 'points')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'is_current', 'created_at')
    search_fields = ('user__email', 'name')
    list_filter = ('is_current', 'created_at')

@admin.register(UserAvatar)
class UserAvatarAdmin(admin.ModelAdmin):
    list_display = ('profile', 'avatar_url', 'created_at')

@admin.register(UserCountry)
class UserCountryAdmin(admin.ModelAdmin):
    list_display = ('profile', 'country', 'created_at')
    list_filter = ('country',)

@admin.register(UserUniversity)
class UserUniversityAdmin(admin.ModelAdmin):
    list_display = ('profile', 'university', 'created_at')
    search_fields = ('university',)

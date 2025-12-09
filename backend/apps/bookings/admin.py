from django.contrib import admin
from .models import (
    Booking, BookingDomain, BookingExpectation, 
    BookingMainQuestion, BookingStatusHistory
)

class BookingDomainInline(admin.TabularInline):
    model = BookingDomain
    extra = 0

class BookingExpectationInline(admin.StackedInline):
    model = BookingExpectation
    extra = 0

class BookingMainQuestionInline(admin.StackedInline):
    model = BookingMainQuestion
    extra = 0

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'mentor', 'date', 'time', 'status', 'created_at')
    list_filter = ('status', 'date', 'created_at')
    search_fields = ('student__email', 'mentor__email')
    inlines = [BookingDomainInline, BookingExpectationInline, BookingMainQuestionInline]

@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('booking', 'previous_status', 'new_status', 'changed_by', 'created_at')
    list_filter = ('new_status', 'created_at')

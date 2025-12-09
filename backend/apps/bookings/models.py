# ============================================
# apps/bookings/models.py - Système Réservation
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin
from apps.users.models import User

class Booking(TimestampMixin, SoftDeleteMixin):
    """Réservation de session avec mentor"""
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmé'),
        ('REJECTED', 'Refusé'),
        ('COMPLETED', 'Terminé'),
        ('CANCELLED', 'Annulé'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_student')
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_mentor')
    date = models.DateField(db_index=True)
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'
        indexes = [
            models.Index(fields=['student', 'status', 'is_active']),
            models.Index(fields=['mentor', 'status', 'is_active']),
            models.Index(fields=['date', 'time']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.id}: {self.student.email} -> {self.mentor.email}"

class BookingDomain(TimestampMixin):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='domains')
    domain = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'booking_domains'

class BookingExpectation(TimestampMixin, VersionedFieldMixin):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='expectations')
    expectation = models.TextField()
    
    class Meta:
        db_table = 'booking_expectations'

class BookingMainQuestion(TimestampMixin, VersionedFieldMixin):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='main_questions')
    question = models.TextField()
    
    class Meta:
        db_table = 'booking_main_questions'

class BookingStatusHistory(TimestampMixin):
    """Traçabilité des changements de statut"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'booking_status_history'
        ordering = ['-created_at']
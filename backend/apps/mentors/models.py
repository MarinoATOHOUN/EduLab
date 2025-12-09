# ============================================
# apps/mentors/models.py - Gestion Mentors
# ============================================
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin
from apps.users.models import User

class MentorProfile(TimestampMixin, SoftDeleteMixin):
    """Profil mentor"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    rating = models.FloatField(default=0.0, db_index=True)
    reviews_count = models.IntegerField(default=0, db_index=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    total_sessions = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'mentor_profiles'
        verbose_name = 'Profil Mentor'
        verbose_name_plural = 'Profils Mentors'
        indexes = [
            models.Index(fields=['rating', 'is_verified', 'is_active']),
        ]
    
    def __str__(self):
        return f"Mentor: {self.user.email}"
    
    def update_rating(self):
        """Recalculer la moyenne des notes"""
        reviews = self.reviews.filter(is_active=True)
        if reviews.exists():
            self.rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.reviews_count = reviews.count()
            self.save()

class MentorBio(TimestampMixin, VersionedFieldMixin):
    mentor_profile = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='bios')
    bio = models.TextField()
    
    class Meta:
        db_table = 'mentor_bios'

class MentorSpecialty(TimestampMixin, SoftDeleteMixin):
    mentor_profile = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='specialties')
    specialty = models.CharField(max_length=100, db_index=True)
    
    class Meta:
        db_table = 'mentor_specialties'
        unique_together = ['mentor_profile', 'specialty', 'is_active']

class MentorAvailability(TimestampMixin, SoftDeleteMixin):
    """Disponibilités structurées (récurrentes hebdomadaires)"""
    DAY_CHOICES = [
        ('MONDAY', 'Lundi'),
        ('TUESDAY', 'Mardi'),
        ('WEDNESDAY', 'Mercredi'),
        ('THURSDAY', 'Jeudi'),
        ('FRIDAY', 'Vendredi'),
        ('SATURDAY', 'Samedi'),
        ('SUNDAY', 'Dimanche'),
    ]
    
    mentor_profile = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES, db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    class Meta:
        db_table = 'mentor_availabilities'
        ordering = ['day_of_week', 'start_time']

class MentorSpecificDateAvailability(TimestampMixin, SoftDeleteMixin):
    """Disponibilités pour des dates spécifiques (ponctuelles)"""
    mentor_profile = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='specific_date_availabilities')
    specific_date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    class Meta:
        db_table = 'mentor_specific_date_availabilities'
        ordering = ['specific_date', 'start_time']
        unique_together = ['mentor_profile', 'specific_date', 'start_time', 'is_active']

class MentorSocial(TimestampMixin, SoftDeleteMixin):
    PLATFORM_CHOICES = [
        ('LINKEDIN', 'LinkedIn'),
        ('TWITTER', 'Twitter'),
        ('WEBSITE', 'Site Web'),
        ('GITHUB', 'GitHub'),
    ]
    
    mentor_profile = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='socials')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    url = models.URLField(max_length=500)
    
    class Meta:
        db_table = 'mentor_socials'
        unique_together = ['mentor_profile', 'platform', 'is_active']

class MentorReview(TimestampMixin, SoftDeleteMixin):
    mentor_profile = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, related_name='review')
    
    class Meta:
        db_table = 'mentor_reviews'
        unique_together = ['mentor_profile', 'student', 'booking', 'is_active']

class MentorReviewComment(TimestampMixin, VersionedFieldMixin):
    review = models.ForeignKey(MentorReview, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField()
    
    class Meta:
        db_table = 'mentor_review_comments'

class MentorApplication(TimestampMixin, SoftDeleteMixin):
    """Demande pour devenir mentor"""
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Rejeté'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_applications')
    cv_file = models.FileField(upload_to='mentors/cvs/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Données du formulaire
    bio = models.TextField()
    university = models.CharField(max_length=255, blank=True)
    specialties = models.JSONField(default=list)  # Liste de strings
    availability = models.JSONField(default=dict)  # Structure JSON des disponibilités
    
    # Réseaux sociaux
    linkedin = models.URLField(max_length=500, blank=True)
    twitter = models.URLField(max_length=500, blank=True)
    website = models.URLField(max_length=500, blank=True)
    
    class Meta:
        db_table = 'mentor_applications'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Application: {self.user.email} ({self.status})"

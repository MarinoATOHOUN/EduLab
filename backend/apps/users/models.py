# ============================================
# apps/users/models.py - Gestion Utilisateurs
# ============================================
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from apps.core.models import TimestampMixin, SoftDeleteMixin, VersionedFieldMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'adresse email est obligatoire')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, TimestampMixin, SoftDeleteMixin):
    """Modèle utilisateur personnalisé"""
    ROLE_CHOICES = [
        ('STUDENT', 'Étudiant'),
        ('MENTOR', 'Mentor'),
        ('ADMIN', 'Administrateur'),
    ]
    
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT', db_index=True)
    points = models.IntegerField(default=0, db_index=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        indexes = [
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['role', 'is_active']),
            models.Index(fields=['points'], name='idx_user_points'),
        ]
    
    def __str__(self):
        return self.email
    
    def add_points(self, points, reason=''):
        """Ajouter des points avec traçabilité"""
        from apps.gamification.models import UserPointsHistory
        
        previous_total = self.points
        self.points += points
        self.save()
        
        UserPointsHistory.objects.create(
            user=self,
            points_change=points,
            previous_total=previous_total,
            new_total=self.points,
            reason=reason
        )
        
        return self.points

class UserProfile(TimestampMixin, VersionedFieldMixin):
    """Profil utilisateur versionné"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profiles')
    name = models.CharField(max_length=255)
    public_key = models.TextField(null=True, blank=True)
    encrypted_private_key = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'Profil Utilisateur'
        verbose_name_plural = 'Profils Utilisateurs'
        indexes = [
            models.Index(fields=['user', 'is_current']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.user.email})"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            UserProfile.objects.filter(user=self.user, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)

class UserAvatar(TimestampMixin, VersionedFieldMixin):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='avatars')
    avatar_url = models.URLField(max_length=500)
    
    class Meta:
        db_table = 'user_avatars'

class UserCountry(TimestampMixin, VersionedFieldMixin):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='countries')
    country = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'user_countries'

class UserUniversity(TimestampMixin, VersionedFieldMixin):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='universities')
    university = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'user_universities'


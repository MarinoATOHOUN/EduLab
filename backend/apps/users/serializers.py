"""
==============================================
SERIALIZERS COMPLETS - EDUCONNECT AFRICA API
==============================================
"""

# ============================================
# apps/users/serializers.py
# ============================================
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from apps.users.models import (
    User, UserProfile, UserAvatar, UserCountry, UserUniversity
)
from apps.core.serializers import HashIdField

class UserProfileDetailSerializer(serializers.ModelSerializer):
    """Détails complets du profil"""
    name = serializers.CharField()
    avatar = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()
    university = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['name', 'avatar', 'country', 'university', 'public_key', 'encrypted_private_key']
    
    def get_avatar(self, obj):
        avatar = obj.avatars.filter(is_current=True).first()
        return avatar.avatar_url if avatar else None
    
    def get_country(self, obj):
        country = obj.countries.filter(is_current=True).first()
        return country.country if country else None
    
    def get_university(self, obj):
        uni = obj.universities.filter(is_current=True).first()
        return uni.university if uni else None

class UserSerializer(serializers.ModelSerializer):
    """Serializer utilisateur de base"""
    id = HashIdField(read_only=True)
    profile = serializers.SerializerMethodField()
    mentor_application_status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'points', 'email_verified',
            'profile', 'mentor_application_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'points', 'created_at', 'updated_at']
    
    def get_profile(self, obj):
        current_profile = obj.profiles.filter(is_current=True).first()
        if current_profile:
            return UserProfileDetailSerializer(current_profile).data
        return None

    def get_mentor_application_status(self, obj):
        last_app = obj.mentor_applications.order_by('-created_at').first()
        return last_app.status if last_app else None

class UserRegistrationSerializer(serializers.Serializer):
    """Inscription utilisateur"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=['STUDENT', 'MENTOR'], default='STUDENT')
    # role = serializers.CharField(default='STUDENT', read_only=True) # Force STUDENT
    country = serializers.CharField(max_length=100, required=False)
    university = serializers.CharField(max_length=255, required=False)
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé")
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        # Force role to STUDENT initially (User must apply to become mentor)
        validated_data['role'] = 'STUDENT'
        
        # Extraire les données du profil
        name = validated_data.pop('name')
        country = validated_data.pop('country', None)
        university = validated_data.pop('university', None)
        
        # Créer l'utilisateur
        user = User.objects.create_user(**validated_data)
        
        # Créer le profil
        profile = UserProfile.objects.create(user=user, name=name)
        
        if country:
            UserCountry.objects.create(profile=profile, country=country)
        
        if university:
            UserUniversity.objects.create(profile=profile, university=university)
        
        return user

class UserLoginSerializer(serializers.Serializer):
    """Connexion utilisateur"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(
            username=data['email'],
            password=data['password']
        )
        
        if not user:
            raise serializers.ValidationError("Identifiants invalides")
        
        if not user.is_active:
            raise serializers.ValidationError("Compte désactivé")
        
        data['user'] = user
        return data

class UserProfileUpdateSerializer(serializers.Serializer):
    """Mise à jour du profil"""
    name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    avatar = serializers.URLField(required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    university = serializers.CharField(max_length=255, required=False, allow_blank=True)
    public_key = serializers.CharField(required=False, allow_blank=True)
    encrypted_private_key = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        from django.db import transaction
        
        # Utiliser select_for_update pour éviter les conflits
        with transaction.atomic():
            # Verrouiller l'utilisateur pour éviter les conflits
            instance = instance.__class__.objects.select_for_update().get(pk=instance.pk)
            current_profile = instance.profiles.filter(is_current=True).first()
            
            # Si changement de nom, créer un nouveau profil
            if 'name' in validated_data and validated_data['name']:
                # Désactiver manuellement les anciens profils AVANT de créer le nouveau
                instance.profiles.filter(is_current=True).update(is_current=False)
                
                new_profile = UserProfile.objects.create(
                    user=instance,
                    name=validated_data['name'],
                    is_current=True,
                    public_key=current_profile.public_key if current_profile else None,
                    encrypted_private_key=current_profile.encrypted_private_key if current_profile else None
                )
                
                # Copier les autres infos actuelles
                if current_profile:
                    avatar = current_profile.avatars.filter(is_current=True).first()
                    if avatar:
                        UserAvatar.objects.create(
                            profile=new_profile,
                            avatar_url=avatar.avatar_url,
                            is_current=True
                        )
            else:
                new_profile = current_profile

            # Mise à jour des clés si fournies
            if 'public_key' in validated_data:
                new_profile.public_key = validated_data['public_key']
            if 'encrypted_private_key' in validated_data:
                new_profile.encrypted_private_key = validated_data['encrypted_private_key']
            
            if 'public_key' in validated_data or 'encrypted_private_key' in validated_data:
                new_profile.save()
            
            # Mettre à jour l'avatar
            if 'avatar' in validated_data and validated_data['avatar'] and new_profile:
                # Désactiver les anciens avatars
                new_profile.avatars.filter(is_current=True).update(is_current=False)
                UserAvatar.objects.create(
                    profile=new_profile,
                    avatar_url=validated_data['avatar'],
                    is_current=True
                )
            
            # Mettre à jour le pays
            if 'country' in validated_data and validated_data['country'] and new_profile:
                # Désactiver les anciens pays
                new_profile.countries.filter(is_current=True).update(is_current=False)
                UserCountry.objects.create(
                    profile=new_profile,
                    country=validated_data['country'],
                    is_current=True
                )
            
            # Mettre à jour l'université
            if 'university' in validated_data and validated_data['university'] and new_profile:
                # Désactiver les anciennes universités
                new_profile.universities.filter(is_current=True).update(is_current=False)
                UserUniversity.objects.create(
                    profile=new_profile,
                    university=validated_data['university'],
                    is_current=True
                )
        
        return instance





# ============================================
# apps/mentors/serializers.py
# ============================================
from rest_framework import serializers
from apps.mentors.models import (
    MentorProfile, MentorBio, MentorSpecialty, MentorAvailability,
    MentorSocial, MentorReview, MentorApplication
)
from apps.users.serializers import UserSerializer
from apps.core.serializers import HashIdField

class MentorAvailabilitySerializer(serializers.ModelSerializer):
    day_label = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = MentorAvailability
        fields = ['id', 'day_of_week', 'day_label', 'start_time', 'end_time']

class MentorSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorSpecialty
        fields = ['id', 'specialty']

class MentorSocialSerializer(serializers.ModelSerializer):
    platform_label = serializers.CharField(source='get_platform_display', read_only=True)
    
    class Meta:
        model = MentorSocial
        fields = ['id', 'platform', 'platform_label', 'url']

class MentorProfileDetailSerializer(serializers.ModelSerializer):
    id = HashIdField(read_only=True)
    user = UserSerializer(read_only=True)
    bio = serializers.SerializerMethodField()
    specialties = serializers.SerializerMethodField()
    availabilities = serializers.SerializerMethodField()
    socials = serializers.SerializerMethodField()
    
    class Meta:
        model = MentorProfile
        fields = [
            'id', 'user', 'bio', 'specialties', 'availabilities',
            'socials', 'rating', 'reviews_count', 'is_verified',
            'total_sessions', 'created_at'
        ]
    
    def get_bio(self, obj):
        bio = obj.bios.filter(is_current=True).first()
        return bio.bio if bio else None
    
    def get_specialties(self, obj):
        specialties = obj.specialties.filter(is_active=True)
        return [s.specialty for s in specialties]
    
    def get_availabilities(self, obj):
        # Récupérer les créneaux récurrents
        recurring = obj.availabilities.filter(is_active=True)
        recurring_list = []
        
        day_mapping = {
            'MONDAY': 'Lundi', 'TUESDAY': 'Mardi', 'WEDNESDAY': 'Mercredi',
            'THURSDAY': 'Jeudi', 'FRIDAY': 'Vendredi', 'SATURDAY': 'Samedi', 'SUNDAY': 'Dimanche'
        }
        
        for avail in recurring:
            day_label = day_mapping.get(avail.day_of_week, avail.day_of_week)
            recurring_list.append(f"{day_label} : {avail.start_time.strftime('%H:%M')} - {avail.end_time.strftime('%H:%M')}")
        
        # Récupérer les dates spécifiques
        specific = obj.specific_date_availabilities.filter(is_active=True)
        specific_list = []
        
        for avail in specific:
            date_str = avail.specific_date.strftime('%d/%m/%Y')
            specific_list.append(f"{date_str} : {avail.start_time.strftime('%H:%M')} - {avail.end_time.strftime('%H:%M')}")
        
        # Combiner et retourner comme string formaté
        all_availabilities = recurring_list + specific_list
        return ' • '.join(all_availabilities) if all_availabilities else None
    
    def get_socials(self, obj):
        socials = obj.socials.filter(is_active=True)
        return MentorSocialSerializer(socials, many=True).data

class MentorProfileListSerializer(serializers.ModelSerializer):
    """Version simplifiée pour les listes"""
    id = HashIdField(read_only=True)
    user = UserSerializer(read_only=True)
    bio = serializers.SerializerMethodField()
    specialties = serializers.SerializerMethodField()
    
    class Meta:
        model = MentorProfile
        fields = [
            'id', 'user', 'bio', 'specialties', 'rating',
            'reviews_count', 'is_verified', 'total_sessions'
        ]

    def get_bio(self, obj):
        bio = obj.bios.filter(is_current=True).first()
        return bio.bio[:200] if bio else None  # Tronquer pour la liste
    
    def get_specialties(self, obj):
        specialties = obj.specialties.filter(is_active=True)[:5]
        return [s.specialty for s in specialties]

class MentorProfileUpdateSerializer(serializers.Serializer):
    """Mise à jour profil mentor"""
    bio = serializers.CharField(required=False, allow_blank=True)
    specialties = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False
    )
    availabilities = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    socials = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    
    def update(self, instance, validated_data):
        from django.db import transaction
        import logging
        
        logger = logging.getLogger(__name__)
        logger.info('🔵 [BACKEND] Starting mentor profile update...')
        logger.info(f'📊 [BACKEND] Received data: {validated_data}')
        
        with transaction.atomic():
            # Mise à jour bio
            if 'bio' in validated_data:
                logger.info(f'📝 [BACKEND] Updating bio: {validated_data["bio"][:50]}...')
                # Désactiver les anciennes bios
                instance.bios.filter(is_current=True).update(is_current=False)
                MentorBio.objects.create(
                    mentor_profile=instance,
                    bio=validated_data['bio'],
                    is_current=True
                )
            
            # Mise à jour spécialités
            if 'specialties' in validated_data:
                logger.info(f'🎯 [BACKEND] Updating specialties: {validated_data["specialties"]}')
                # Désactiver anciennes
                instance.specialties.filter(is_active=True).update(is_active=False)
                # Créer nouvelles
                for specialty in validated_data['specialties']:
                    MentorSpecialty.objects.create(
                        mentor_profile=instance,
                        specialty=specialty
                    )
            
            # Mise à jour disponibilités
            if 'availabilities' in validated_data:
                from apps.mentors.models import MentorSpecificDateAvailability
                
                availabilities_data = validated_data['availabilities']
                logger.info(f'📅 [BACKEND] Processing {len(availabilities_data)} availability slots')
                logger.info(f'📋 [BACKEND] Availabilities data: {availabilities_data}')
                
                # Désactiver toutes les anciennes disponibilités (récurrentes et spécifiques)
                old_recurring_count = instance.availabilities.filter(is_active=True).count()
                old_specific_count = instance.specific_date_availabilities.filter(is_active=True).count()
                
                instance.availabilities.filter(is_active=True).update(is_active=False)
                instance.specific_date_availabilities.filter(is_active=True).update(is_active=False)
                
                logger.info(f'🗑️ [BACKEND] Deactivated {old_recurring_count} recurring and {old_specific_count} specific slots')
                
                recurring_created = 0
                specific_created = 0
                
                for avail in availabilities_data:
                    # Vérifier si c'est un créneau récurrent (day_of_week) ou une date spécifique (specific_date)
                    if 'day_of_week' in avail:
                        # Créneau hebdomadaire récurrent
                        logger.info(f'➕ [BACKEND] Creating recurring slot: {avail}')
                        MentorAvailability.objects.create(
                            mentor_profile=instance,
                            day_of_week=avail['day_of_week'],
                            start_time=avail['start_time'],
                            end_time=avail['end_time']
                        )
                        recurring_created += 1
                    elif 'specific_date' in avail:
                        # Date spécifique ponctuelle
                        logger.info(f'➕ [BACKEND] Creating specific date slot: {avail}')
                        MentorSpecificDateAvailability.objects.create(
                            mentor_profile=instance,
                            specific_date=avail['specific_date'],
                            start_time=avail['start_time'],
                            end_time=avail['end_time']
                        )
                        specific_created += 1
                    else:
                        logger.warning(f'⚠️ [BACKEND] Unknown availability format: {avail}')
                
                logger.info(f'✅ [BACKEND] Created {recurring_created} recurring and {specific_created} specific slots')
            
            # Mise à jour réseaux sociaux
            if 'socials' in validated_data:
                logger.info(f'🔗 [BACKEND] Updating social links')
                instance.socials.filter(is_active=True).update(is_active=False)
                
                # Le frontend envoie un dict avec linkedin, twitter, website
                # On doit le transformer en liste de dicts avec platform et url
                socials_dict = validated_data['socials']
                
                if isinstance(socials_dict, dict):
                    # Format: {'linkedin': 'url', 'twitter': 'url', 'website': 'url'}
                    platform_mapping = {
                        'linkedin': 'LINKEDIN',
                        'twitter': 'TWITTER',
                        'website': 'WEBSITE'
                    }
                    
                    for key, url in socials_dict.items():
                        if url and key in platform_mapping:
                            MentorSocial.objects.create(
                                mentor_profile=instance,
                                platform=platform_mapping[key],
                                url=url
                            )
                            logger.info(f'➕ [BACKEND] Added {platform_mapping[key]}: {url}')
                elif isinstance(socials_dict, list):
                    # Format: [{'platform': 'LINKEDIN', 'url': 'url'}, ...]
                    for social in socials_dict:
                        if 'platform' in social and 'url' in social:
                            MentorSocial.objects.create(
                                mentor_profile=instance,
                                platform=social['platform'],
                                url=social['url']
                            )
                            logger.info(f'➕ [BACKEND] Added {social["platform"]}: {social["url"]}')
        
        logger.info('🎉 [BACKEND] Mentor profile update completed successfully!')
        return instance

class MentorReviewSerializer(serializers.ModelSerializer):
    id = HashIdField(read_only=True)
    student = UserSerializer(read_only=True)
    comment = serializers.SerializerMethodField()
    
    class Meta:
        model = MentorReview
        fields = ['id', 'student', 'rating', 'comment', 'created_at']
    
    def get_comment(self, obj):
        comment = obj.comments.filter(is_current=True).first()
        return comment.comment if comment else None

class MentorReviewCreateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        from django.db import transaction
        from apps.mentors.models import MentorReviewComment
        
        mentor_profile = self.context['mentor_profile']
        student = self.context['request'].user
        
        with transaction.atomic():
            # Créer la review
            review = MentorReview.objects.create(
                mentor_profile=mentor_profile,
                student=student,
                rating=validated_data['rating']
            )
            
            # Ajouter le commentaire si présent
            if validated_data.get('comment'):
                MentorReviewComment.objects.create(
                    review=review,
                    comment=validated_data['comment'],
                    is_current=True
                )
            
            # Mettre à jour la moyenne du mentor
            mentor_profile.update_rating()
            
        return review

class MentorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorApplication
        fields = [
            'id', 'user', 'cv_file', 'status', 'bio', 'university',
            'specialties', 'availability', 'linkedin', 'twitter', 'website',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at']
        
    def validate_cv_file(self, value):
        if not value.name.endswith('.pdf'):
            raise serializers.ValidationError("Le fichier doit être un PDF.")
        if value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("Le fichier ne doit pas dépasser 5 Mo.")
        return value

# ============================================
# apps/bookings/serializers.py
# ============================================
from rest_framework import serializers
from apps.bookings.models import (
    Booking, BookingDomain, BookingExpectation, BookingMainQuestion
)
from apps.users.serializers import UserSerializer
from apps.core.serializers import HashIdField

class BookingSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    mentor = UserSerializer(read_only=True)
    domains = serializers.SerializerMethodField()
    expectation = serializers.SerializerMethodField()
    main_question = serializers.SerializerMethodField()
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    id = HashIdField(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'student', 'mentor', 'date', 'time', 'status', 'status_label',
            'domains', 'expectation', 'main_question', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']
    
    def get_domains(self, obj):
        return [d.domain for d in obj.domains.all()]
    
    def get_expectation(self, obj):
        exp = obj.expectations.filter(is_current=True).first()
        return exp.expectation if exp else None
    
    def get_main_question(self, obj):
        q = obj.main_questions.filter(is_current=True).first()
        return q.question if q else None

class BookingCreateSerializer(serializers.Serializer):
    """Création d'une réservation"""
    mentor_id = HashIdField()
    date = serializers.DateField()
    time = serializers.TimeField()
    domains = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1
    )
    expectations = serializers.CharField()
    main_questions = serializers.CharField()
    
    def validate_mentor_id(self, value):
        from apps.users.models import User
        try:
            mentor = User.objects.get(id=value, role='MENTOR', is_active=True)
            if not hasattr(mentor, 'mentor_profile'):
                raise serializers.ValidationError("Ce mentor n'a pas de profil actif")
        except User.DoesNotExist:
            raise serializers.ValidationError("Mentor introuvable")
        return value
    
    def validate_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("La date doit être dans le futur")
        return value
    
    def create(self, validated_data):
        from django.db import transaction
        from apps.users.models import User
        
        user = self.context['request'].user
        mentor = User.objects.get(id=validated_data['mentor_id'])
        domains = validated_data.pop('domains')
        expectations = validated_data.pop('expectations')
        main_question = validated_data.pop('main_questions')
        validated_data.pop('mentor_id')
        
        with transaction.atomic():
            booking = Booking.objects.create(
                student=user,
                mentor=mentor,
                **validated_data
            )
            
            # Ajouter domaines
            for domain in domains:
                BookingDomain.objects.create(booking=booking, domain=domain)
            
            # Ajouter attentes
            BookingExpectation.objects.create(
                booking=booking,
                expectation=expectations
            )
            
            # Ajouter question principale
            BookingMainQuestion.objects.create(
                booking=booking,
                question=main_question
            )
            
            # Créer notification pour le mentor
            from apps.notifications.services import NotificationService
            NotificationService.create_booking_notification(booking)
        
        return booking

class BookingStatusUpdateSerializer(serializers.Serializer):
    """Mise à jour du statut"""
    status = serializers.ChoiceField(choices=['CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED'])
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        from apps.bookings.models import BookingStatusHistory
        from django.db import transaction
        
        with transaction.atomic():
            previous_status = instance.status
            instance.status = validated_data['status']
            instance.save()
            
            # Historiser
            BookingStatusHistory.objects.create(
                booking=instance,
                previous_status=previous_status,
                new_status=validated_data['status'],
                changed_by=self.context['request'].user,
                reason=validated_data.get('reason', '')
            )
            
            # Créer notification pour l'étudiant
            from apps.notifications.services import NotificationService
            NotificationService.create_booking_status_notification(instance)
            
            # Attribution de points si complété
            if validated_data['status'] == 'COMPLETED':
                from django.conf import settings
                instance.student.add_points(
                    settings.GAMIFICATION_POINTS['BOOKING_COMPLETED'],
                    'booking_completed'
                )
        
        return instance

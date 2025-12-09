# ============================================
# apps/mentors/views.py
# ============================================
from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.mentors.models import MentorProfile
from apps.mentors.serializers import (
    MentorProfileListSerializer, MentorProfileDetailSerializer,
    MentorProfileUpdateSerializer, MentorReviewSerializer,
    MentorReviewCreateSerializer
)
from apps.core.mixins import HashIdMixin

class MentorViewSet(HashIdMixin, viewsets.ReadOnlyModelViewSet):
    """Liste et détails des mentors"""
    permission_classes = [IsAuthenticated]
    queryset = MentorProfile.objects.filter(is_active=True, is_verified=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__email', 'bios__bio']
    ordering_fields = ['rating', 'reviews_count', 'created_at']
    ordering = ['-rating']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MentorProfileDetailSerializer
        return MentorProfileListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtre par pays
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(
                user__profiles__countries__country__icontains=country,
                user__profiles__countries__is_current=True
            )
        
        # Filtre par spécialité
        specialty = self.request.query_params.get('specialty')
        if specialty:
            queryset = queryset.filter(
                specialties__specialty__icontains=specialty,
                specialties__is_active=True
            )
        
        return queryset.distinct()
    
    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        """GET/PATCH /api/mentors/my_profile/"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            mentor_profile = request.user.mentor_profile
        except MentorProfile.DoesNotExist:
            return Response(
                {'error': 'Vous n\'avez pas de profil mentor'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            logger.info(f'📖 [VIEW] GET my_profile for user: {request.user.email}')
            serializer = MentorProfileDetailSerializer(mentor_profile)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            logger.info(f'✏️ [VIEW] PATCH my_profile for user: {request.user.email}')
            logger.info(f'📥 [VIEW] Request data: {request.data}')
            
            serializer = MentorProfileUpdateSerializer(
                mentor_profile,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            logger.info(f'✅ [VIEW] Profile updated successfully')
            return Response(MentorProfileDetailSerializer(mentor_profile).data)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """GET /api/mentors/{id}/reviews/"""
        mentor = self.get_object()
        reviews = mentor.reviews.filter(is_active=True).order_by('-created_at')
        
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = MentorReviewSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = MentorReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rate(self, request, pk=None):
        """POST /api/mentors/{id}/rate/"""
        mentor = self.get_object()
        
        # Vérifier si l'utilisateur a déjà noté ce mentor
        if mentor.reviews.filter(student=request.user, is_active=True).exists():
            return Response(
                {'error': 'Vous avez déjà noté ce mentor'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # On ne peut pas se noter soi-même
        if mentor.user == request.user:
            return Response(
                {'error': 'Vous ne pouvez pas vous noter vous-même'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = MentorReviewCreateSerializer(
            data=request.data,
            context={'request': request, 'mentor_profile': mentor}
        )
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        
        return Response(MentorReviewSerializer(review).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request):
        """POST /api/mentors/apply/"""
        from apps.mentors.models import MentorApplication
        from apps.mentors.serializers import MentorApplicationSerializer
        
        # Vérifier si l'utilisateur a déjà une demande en cours
        if MentorApplication.objects.filter(user=request.user, status='PENDING').exists():
            return Response(
                {'error': 'Vous avez déjà une demande en cours d\'examen.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = MentorApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save(user=request.user)
        
        # =========================================================
        # Création automatique du profil Mentor (Non vérifié)
        # =========================================================
        from apps.mentors.models import (
            MentorProfile, MentorBio, MentorSpecialty, 
            MentorAvailability, MentorSocial
        )
        from apps.users.models import UserUniversity
        
        # Créer ou récupérer le profil mentor
        mentor_profile, created = MentorProfile.objects.get_or_create(user=request.user)
        
        # S'assurer qu'il est non vérifié par défaut (en attente de validation admin)
        if not mentor_profile.is_verified:
            mentor_profile.is_verified = False
            mentor_profile.save()
            
        # 1. Bio
        if application.bio:
            # Désactiver les anciennes bios
            mentor_profile.bios.filter(is_current=True).update(is_current=False)
            MentorBio.objects.create(
                mentor_profile=mentor_profile,
                bio=application.bio,
                is_current=True
            )
            
        # 2. Spécialités
        if application.specialties:
            mentor_profile.specialties.filter(is_active=True).update(is_active=False)
            for spec in application.specialties:
                MentorSpecialty.objects.create(
                    mentor_profile=mentor_profile,
                    specialty=spec
                )
                
        # 3. Disponibilités
        if application.availability:
            mentor_profile.availabilities.filter(is_active=True).update(is_active=False)
            for slot in application.availability:
                # Mapping 'day' -> 'day_of_week' si nécessaire
                day = slot.get('day') or slot.get('day_of_week')
                if day:
                    MentorAvailability.objects.create(
                        mentor_profile=mentor_profile,
                        day_of_week=day,
                        start_time=slot.get('startTime') or slot.get('start_time'),
                        end_time=slot.get('endTime') or slot.get('end_time')
                    )
                    
        # 4. Réseaux sociaux
        mentor_profile.socials.filter(is_active=True).update(is_active=False)
        if application.linkedin:
            MentorSocial.objects.create(mentor_profile=mentor_profile, platform='LINKEDIN', url=application.linkedin)
        if application.twitter:
            MentorSocial.objects.create(mentor_profile=mentor_profile, platform='TWITTER', url=application.twitter)
        if application.website:
            MentorSocial.objects.create(mentor_profile=mentor_profile, platform='WEBSITE', url=application.website)
            
        # 5. Université (Mise à jour du profil utilisateur)
        if application.university:
            user_profile = request.user.profiles.filter(is_current=True).first()
            if user_profile:
                user_profile.universities.filter(is_current=True).update(is_current=False)
                UserUniversity.objects.create(
                    profile=user_profile, 
                    university=application.university,
                    is_current=True
                )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def available_slots(self, request, pk=None):
        """GET /api/mentors/{id}/available_slots/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD"""
        from datetime import datetime, timedelta, date, time
        from apps.bookings.models import Booking
        
        mentor_profile = self.get_object()
        mentor_user = mentor_profile.user
        
        # Paramètres de date
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        today = date.today()
        
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                start_date = today
        else:
            start_date = today
            
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                end_date = today + timedelta(days=14)
        else:
            end_date = today + timedelta(days=14)
            
        # Limiter la recherche au passé
        if start_date < today:
            start_date = today
            
        # Récupérer les disponibilités théoriques (Jours de la semaine)
        # Structure: {'MONDAY': [{'start': time, 'end': time}, ...], ...}
        availabilities = mentor_profile.availabilities.filter(is_active=True)
        weekly_slots = {}
        for avail in availabilities:
            if avail.day_of_week not in weekly_slots:
                weekly_slots[avail.day_of_week] = []
            weekly_slots[avail.day_of_week].append({
                'start': avail.start_time,
                'end': avail.end_time
            })
            
        # Récupérer les réservations existantes (conflits)
        existing_bookings = Booking.objects.filter(
            mentor=mentor_user,
            date__range=[start_date, end_date],
            is_active=True
        ).exclude(status__in=['CANCELLED', 'REJECTED'])
        
        # Organiser les bookings par date et heure pour recherche rapide
        busy_slots = {}
        for booking in existing_bookings:
            d_str = booking.date.isoformat()
            if d_str not in busy_slots:
                busy_slots[d_str] = []
            # On suppose que le booking bloque l'heure exacte de début
            busy_slots[d_str].append(booking.time)
            
        # Générer les créneaux disponibles
        results = {}
        
        # Mapping jour int -> code
        WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
        
        current_date = start_date
        while current_date <= end_date:
            day_code = WEEKDAYS[current_date.weekday()]
            date_str = current_date.isoformat()
            day_slots = []
            
            if day_code in weekly_slots:
                for rule in weekly_slots[day_code]:
                    # Générer des créneaux de 1h entre start et end
                    # Convertir en datetime pour itération facile
                    slot_start = datetime.combine(current_date, rule['start'])
                    slot_end = datetime.combine(current_date, rule['end'])
                    
                    while slot_start + timedelta(hours=1) <= slot_end:
                        slot_time = slot_start.time()
                        
                        # Vérifier si ce créneau est déjà pris
                        is_taken = False
                        if date_str in busy_slots:
                            if slot_time in busy_slots[date_str]:
                                is_taken = True
                                
                        # Vérifier si le créneau est dans le passé (pour aujourd'hui)
                        is_past = False
                        if current_date == today:
                            if slot_time <= datetime.now().time():
                                is_past = True
                                
                        if not is_taken and not is_past:
                            day_slots.append(slot_time.strftime('%H:%M'))
                            
                        slot_start += timedelta(hours=1)
            
            if day_slots:
                results[date_str] = sorted(list(set(day_slots))) # Dedup et tri
                
            current_date += timedelta(days=1)
            
        return Response(results)


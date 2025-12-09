# ============================================
# apps/bookings/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.bookings.models import Booking
from apps.bookings.serializers import (
    BookingSerializer, BookingCreateSerializer, BookingStatusUpdateSerializer
)

from apps.core.mixins import HashIdMixin

class BookingViewSet(HashIdMixin, viewsets.ModelViewSet):
    """Gestion des réservations"""
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.filter(is_active=True)
        
        # Étudiants voient leurs réservations
        if user.role == 'STUDENT':
            queryset = queryset.filter(student=user)
        # Mentors voient les demandes reçues
        elif user.role == 'MENTOR':
            queryset = queryset.filter(mentor=user)
        
        # Filtre par statut
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action == 'update_status':
            return BookingStatusUpdateSerializer
        return BookingSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Utiliser le serializer standard pour la réponse
        response_serializer = BookingSerializer(booking, context=self.get_serializer_context())
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """PATCH /api/bookings/{id}/update_status/"""
        booking = self.get_object()
        
        # Vérifier que c'est le mentor
        if booking.mentor != request.user:
            return Response(
                {'error': 'Seul le mentor peut modifier le statut'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BookingStatusUpdateSerializer(
            booking,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(BookingSerializer(booking).data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mentor_requests(self, request):
        """GET /api/bookings/mentor_requests/ - Demandes reçues par le mentor"""
        if request.user.role != 'MENTOR':
            return Response(
                {'error': 'Accessible uniquement aux mentors'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookings = Booking.objects.filter(
            mentor=request.user,
            status='PENDING',
            is_active=True
        ).order_by('date', 'time')
        
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)


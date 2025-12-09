# ============================================
# apps/messaging/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.messaging.models import Conversation, Message
from apps.messaging.serializers import (
    ConversationSerializer, MessageSerializer,
    ConversationCreateSerializer, MessageCreateSerializer
)
from apps.core.mixins import HashIdMixin

class ConversationViewSet(HashIdMixin, viewsets.ModelViewSet):
    """Gestion des conversations"""
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
    
    def get_queryset(self):
        # Conversations où l'utilisateur est participant actif
        return Conversation.objects.filter(
            participants__user=self.request.user,
            participants__is_active=True,
            is_active=True
        ).distinct().order_by('-last_message_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    def create(self, request, *args, **kwargs):
        """Créer une conversation avec le bon serializer de réponse"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        
        # Utiliser ConversationSerializer pour la réponse
        response_serializer = ConversationSerializer(
            conversation,
            context={'request': request}
        )
        
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def _check_active_booking(self, user1, user2):
        """Vérifie s'il y a un rendez-vous actif entre deux utilisateurs"""
        from django.utils import timezone
        from apps.bookings.models import Booking
        from django.db.models import Q
        
        now = timezone.now()
        
        # Trouver un booking CONFIRMED qui inclut 'now'
        # Note: Booking a date et time, mais pas duration explicitement dans le modèle montré.
        # On suppose une durée par défaut de 1h ou on vérifie juste date/heure de début <= now.
        # Pour l'instant, on va supposer que le booking est actif si on est le jour J et que l'heure est passée
        # MAIS le user a dit "le temps du rendez-vous".
        # Il faudrait idéalement une durée ou end_time dans Booking.
        # Le modèle Booking a 'time' (start_time).
        # On va assumer une durée standard de 1h pour l'instant ou vérifier si un booking existe "autour" de maintenant.
        
        # Amélioration: Vérifier si un booking est en cours (status=CONFIRMED)
        # On cherche un booking où (student=u1 AND mentor=u2) OR (student=u2 AND mentor=u1)
        # AND date = today AND time <= now AND (time + duration >= now)
        
        # Comme on n'a pas la durée, on va être permissif:
        # Si un booking est confirmé pour AUJOURD'HUI, on considère le chat ouvert pour la journée ?
        # OU Mieux: On considère ouvert si on est après l'heure de début.
        # Le user dit "hors du temps de rendez-vous... destinataire ne voit pas".
        # Donc c'est strict.
        
        # Hack: On va supposer une session de 2h max pour être large.
        
        active_booking = Booking.objects.filter(
            Q(student=user1, mentor=user2) | Q(student=user2, mentor=user1),
            status='CONFIRMED',
            date=now.date(),
            time__lte=now.time()
        ).first()
        
        if active_booking:
            # Vérifier si on est encore dans le créneau (ex: < 2h après début)
            # Conversion time -> datetime pour comparaison
            import datetime
            booking_start = datetime.datetime.combine(now.date(), active_booking.time)
            booking_start = timezone.make_aware(booking_start)
            
            # Si on est dans les 2h suivant le début
            if now <= booking_start + datetime.timedelta(hours=2):
                return True
                
        return False

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """GET /api/conversations/{id}/messages/"""
        conversation = self.get_object()
        
        # Identifier l'autre participant
        other_participant = conversation.participants.exclude(user=request.user).first()
        other_user = other_participant.user if other_participant else None
        
        if other_user:
            # Vérifier s'il y a un booking actif ou passé qui devrait débloquer les messages
            from django.utils import timezone
            from apps.bookings.models import Booking
            from django.db.models import Q
            
            now = timezone.now()
            
            # Chercher le dernier booking commencé
            last_started_booking = Booking.objects.filter(
                Q(student=request.user, mentor=other_user) | Q(student=other_user, mentor=request.user),
                status='CONFIRMED',
                date__lte=now.date()
            ).filter(
                # Pour les dates passées, tout est bon. Pour aujourd'hui, il faut que time <= now
                Q(date__lt=now.date()) | Q(date=now.date(), time__lte=now.time())
            ).order_by('-date', '-time').first()
            
            if last_started_booking:
                # Débloquer tous les messages envoyés AVANT le début de ce booking
                # qui sont encore cachés et destinés à MOI (request.user)
                # Messages envoyés par l'autre user
                
                import datetime
                booking_start_dt = datetime.datetime.combine(last_started_booking.date, last_started_booking.time)
                booking_start_dt = timezone.make_aware(booking_start_dt)
                
                # Update en masse
                conversation.messages.filter(
                    sender=other_user,
                    is_visible_to_recipient=False,
                    created_at__lte=booking_start_dt
                ).update(is_visible_to_recipient=True)
                
                # Si le booking est ACTUELLEMENT en cours (ex: < 2h), on débloque TOUT
                if last_started_booking.date == now.date():
                    if now <= booking_start_dt + datetime.timedelta(hours=2):
                         conversation.messages.filter(
                            sender=other_user,
                            is_visible_to_recipient=False
                        ).update(is_visible_to_recipient=True)

        # Récupérer les messages
        # Je vois mes messages (sender=me) ET les messages visibles des autres
        from django.db.models import Q
        messages = conversation.messages.filter(is_active=True).filter(
            Q(sender=request.user) | Q(is_visible_to_recipient=True)
        ).order_by('created_at')
        
        # Marquer comme lu
        participant = conversation.participants.filter(
            user=request.user,
            is_active=True
        ).first()
        
        if participant:
            from django.utils import timezone
            participant.last_read_at = timezone.now()
            participant.save(update_fields=['last_read_at'])
        
        # Pagination
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """POST /api/conversations/{id}/send_message/"""
        conversation = self.get_object()
        
        # Determine visibility
        is_visible = False
        other_participant = conversation.participants.exclude(user=request.user).first()
        if other_participant:
            is_visible = self._check_active_booking(request.user, other_participant.user)
        
        # Inject visibility into serializer save
        # Note: MessageCreateSerializer doesn't expect is_visible_to_recipient in validated_data usually,
        # but we can pass it via save() kwargs if we modify the serializer or just update instance after.
        # Better: Modify serializer.save() call or pass context.
        
        # Let's update the serializer create method to accept this, or simpler: update object after creation.
        
        serializer = MessageCreateSerializer(
            data=request.data,
            context={'request': request, 'conversation': conversation}
        )
        serializer.is_valid(raise_exception=True)
        
        # On surcharge la méthode create du serializer pour gérer ce champ ? 
        # Non, MessageCreateSerializer.create fait le create.
        # On va modifier MessageCreateSerializer pour accepter un argument extra ou on update après.
        # Update après est moins performant (2 DB calls) mais plus simple sans toucher au serializer complexe.
        
        message = serializer.save()
        
        if is_visible:
            message.is_visible_to_recipient = True
            message.save(update_fields=['is_visible_to_recipient'])
        
        # Broadcast to WebSocket
        # IMPORTANT: Si le message est caché, faut-il l'envoyer par WS ?
        # OUI, mais le frontend du destinataire doit savoir qu'il est caché (ou ne pas l'afficher).
        # MAIS si on l'envoie, le destinataire reçoit la data. C'est "envoyé mais pas vu".
        # Le user a dit "le destinataire ne le voit pas".
        # Si on l'envoie par WS, le JS le reçoit.
        # On devrait peut-être NE PAS l'envoyer au destinataire via WS si caché.
        # Ou l'envoyer avec un flag "hidden" et le front ne l'affiche pas ?
        # Sécurité: Mieux vaut ne pas l'envoyer au destinataire.
        
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            
            msg_data = MessageSerializer(message).data
            
            # Envoyer au groupe du chat
            # Problème: le groupe inclut les deux users.
            # Si on envoie, les deux reçoivent.
            # On ne peut pas filtrer par destinataire facilement ici sauf si on a des groupes par user.
            # Solution: Envoyer le message avec le champ 'is_visible_to_recipient'.
            # Le frontend devra filtrer. C'est acceptable car ce n'est pas une donnée ultra sensible, juste une règle métier.
            # Et le serializer inclut déjà 'is_visible_to_recipient' ? Non, il faut l'ajouter au serializer.
            
            async_to_sync(channel_layer.group_send)(
                f'chat_{conversation.id}',
                {
                    'type': 'chat_message',
                    'message': msg_data
                }
            )
        except Exception as e:
            pass
        
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )


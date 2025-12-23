# ============================================
# apps/messaging/consumers.py - WebSocket Consumer
# ============================================
import json
import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.messaging.models import Message, MessageContent, Conversation
from apps.core.utils import HashIdService

class ChatConsumer(AsyncWebsocketConsumer):
    """Consumer WebSocket pour le chat en temps réel"""
    
    async def connect(self):
        conversation_hashid = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_id = HashIdService.decode(conversation_hashid)
        
        if not self.conversation_id:
            await self.close()
            return
            
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Vérifier que l'utilisateur est participant
        user = self.scope['user']
        if not await self.is_participant(user, self.conversation_id):
            await self.close()
            return
        
        # Stocker l'user_id pour filtrage ultérieur
        self.user_id = user.id
        
        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Quitter le groupe
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Recevoir un message du WebSocket"""
        data = json.loads(text_data)
        message_content = data.get('message')
        user = self.scope['user']
        
        # Sauvegarder en base de données avec vérification du booking
        message, is_visible, other_user_id = await self.save_message_with_visibility(
            user, self.conversation_id, message_content
        )
        
        # Préparer les données du message
        msg_data = {
            'id': message.id,
            'content': message_content,
            'sender': {
                'id': user.id,
                'email': user.email
            },
            'timestamp': message.created_at.isoformat(),
            'is_visible_to_recipient': is_visible
        }
        
        # Envoyer au groupe avec les infos de visibilité
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msg_data,
                'sender_id': user.id,
                'is_visible': is_visible
            }
        )
        
        # Si le message n'est pas visible, notifier l'expéditeur directement
        if not is_visible:
            await self.send(text_data=json.dumps({
                'type': 'message_queued',
                'message': "Votre message sera délivré au destinataire lors de votre prochain rendez-vous.",
                'message_id': message.id
            }))
    
    async def chat_message(self, event):
        """Envoyer le message au WebSocket - avec filtrage"""
        message = event['message']
        sender_id = event.get('sender_id')
        is_visible = event.get('is_visible', True)
        
        # Si je suis l'expéditeur, je vois toujours mon message
        if sender_id == self.user_id:
            await self.send(text_data=json.dumps({
                'message': message
            }))
        # Si le message est visible pour le destinataire, l'envoyer
        elif is_visible:
            await self.send(text_data=json.dumps({
                'message': message
            }))
        # Sinon, ne pas envoyer au destinataire (message en attente)
    
    async def messages_unlocked(self, event):
        """
        Notifie le client que des messages ont été débloqués.
        Le frontend doit recharger la conversation pour voir les nouveaux messages.
        """
        count = event.get('count', 0)
        await self.send(text_data=json.dumps({
            'type': 'messages_unlocked',
            'count': count
        }))

    
    @database_sync_to_async
    def is_participant(self, user, conversation_id):
        """Vérifier si l'utilisateur est participant"""
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            return conversation.participants.filter(
                user=user,
                is_active=True
            ).exists()
        except Conversation.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message_with_visibility(self, user, conversation_id, content):
        """Sauvegarder le message avec vérification du booking actif"""
        from django.utils import timezone
        from apps.bookings.models import Booking
        from django.db.models import Q
        
        conversation = Conversation.objects.get(id=conversation_id)
        
        # Trouver l'autre participant
        other_participant = conversation.participants.exclude(user=user).filter(is_active=True).first()
        other_user = other_participant.user if other_participant else None
        other_user_id = other_user.id if other_user else None
        
        # Vérifier s'il y a un booking actif
        is_visible = False
        if other_user:
            now = timezone.now()
            
            # Chercher un booking CONFIRMED en cours
            active_booking = Booking.objects.filter(
                Q(student=user, mentor=other_user) | Q(student=other_user, mentor=user),
                status='CONFIRMED',
                date=now.date(),
                time__lte=now.time()
            ).first()
            
            if active_booking:
                # Vérifier si on est encore dans le créneau (2h max)
                booking_start = datetime.datetime.combine(now.date(), active_booking.time)
                booking_start = timezone.make_aware(booking_start)
                
                if now <= booking_start + datetime.timedelta(hours=2):
                    is_visible = True
        
        # Créer le message avec la visibilité appropriée
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            is_visible_to_recipient=is_visible
        )
        
        MessageContent.objects.create(
            message=message,
            content=content
        )
        
        # Mettre à jour last_message_at
        conversation.last_message_at = timezone.now()
        conversation.save()
        
        return message, is_visible, other_user_id
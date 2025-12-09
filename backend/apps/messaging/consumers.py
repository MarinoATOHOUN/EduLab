# ============================================
# apps/messaging/consumers.py - WebSocket Consumer
# ============================================
import json
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
        
        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recevoir un message du WebSocket"""
        data = json.loads(text_data)
        message_content = data.get('message')
        user = self.scope['user']
        
        # Sauvegarder en base de données
        message = await self.save_message(user, self.conversation_id, message_content)
        
        # Envoyer au groupe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'content': message_content,
                    'sender': {
                        'id': user.id,
                        'email': user.email
                    },
                    'timestamp': message.created_at.isoformat()
                }
            }
        )
    
    async def chat_message(self, event):
        """Envoyer le message au WebSocket"""
        await self.send(text_data=json.dumps({
            'message': event['message']
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
    def save_message(self, user, conversation_id, content):
        """Sauvegarder le message en base de données"""
        from django.utils import timezone
        
        conversation = Conversation.objects.get(id=conversation_id)
        
        message = Message.objects.create(
            conversation=conversation,
            sender=user
        )
        
        MessageContent.objects.create(
            message=message,
            content=content
        )
        
        # Mettre à jour last_message_at
        conversation.last_message_at = timezone.now()
        conversation.save()
        
        return message
# ============================================
# apps/messaging/serializers.py
# ============================================
from rest_framework import serializers
from apps.messaging.models import (
    Conversation, ConversationParticipant, Message, MessageContent, MessageAttachment
)
from apps.users.serializers import UserSerializer
from apps.core.serializers import HashIdField

class MessageAttachmentSerializer(serializers.ModelSerializer):
    id = HashIdField(read_only=True)
    class Meta:
        model = MessageAttachment
        fields = ['id', 'file_url', 'file_name', 'file_type', 'file_size']

class MessageSerializer(serializers.ModelSerializer):
    id = HashIdField(read_only=True)
    sender = UserSerializer(read_only=True)
    content = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'attachments', 'created_at', 'is_encrypted', 'encrypted_keys', 'is_visible_to_recipient']
    
    def get_content(self, obj):
        content = obj.contents.filter(is_current=True).first()
        return content.content if content else None
    
    def get_attachments(self, obj):
        attachments = obj.attachments.filter(is_active=True)
        return MessageAttachmentSerializer(attachments, many=True).data

class ConversationSerializer(serializers.ModelSerializer):
    id = HashIdField(read_only=True)
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'last_message', 'unread_count',
            'last_message_at', 'created_at'
        ]
    
    def get_participants(self, obj):
        parts = obj.participants.filter(is_active=True)
        return UserSerializer([p.user for p in parts], many=True).data
    
    def get_last_message(self, obj):
        last_msg = obj.messages.filter(is_active=True).last()
        return MessageSerializer(last_msg).data if last_msg else None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            participant = obj.participants.filter(
                user=request.user,
                is_active=True
            ).first()
            if participant:
                return participant.get_unread_count()
        return 0

class MessageCreateSerializer(serializers.Serializer):
    content = serializers.CharField(required=False, allow_blank=True)
    attachments = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )
    
    is_encrypted = serializers.BooleanField(required=False, default=False)
    encrypted_keys = serializers.DictField(required=False, default=dict)
    
    def validate(self, data):
        # Au moins un contenu ou une pièce jointe
        if not data.get('content') and not data.get('attachments'):
            raise serializers.ValidationError("Le message doit contenir du texte ou des pièces jointes")
        return data
    
    def create(self, validated_data):
        from django.db import transaction
        
        user = self.context['request'].user
        conversation = self.context['conversation']
        attachments_data = validated_data.pop('attachments', [])
        is_encrypted = validated_data.pop('is_encrypted', False)
        encrypted_keys = validated_data.pop('encrypted_keys', {})
        
        with transaction.atomic():
            message = Message.objects.create(
                conversation=conversation,
                sender=user,
                is_encrypted=is_encrypted,
                encrypted_keys=encrypted_keys
            )
            
            # Créer le contenu si présent
            if validated_data.get('content'):
                MessageContent.objects.create(
                    message=message,
                    content=validated_data['content']
                )
            
            # Créer les pièces jointes
            for attachment_data in attachments_data:
                MessageAttachment.objects.create(
                    message=message,
                    file_url=attachment_data.get('file_url'),
                    file_name=attachment_data.get('file_name'),
                    file_type=attachment_data.get('file_type'),
                    file_size=attachment_data.get('file_size', 0)
                )
            
            # Mettre à jour last_message_at
            conversation.last_message_at = message.created_at
            conversation.save()
            
            # Notifications aux autres participants
            try:
                from apps.notifications.services import NotificationService
                NotificationService.create_message_notifications(message)
            except:
                pass  # Ignorer si le service n'est pas encore implémenté
        
        return message

class ConversationCreateSerializer(serializers.Serializer):
    participant_ids = serializers.ListField(
        child=HashIdField(),
        min_length=1
    )
    initial_message = serializers.CharField()
    
    def validate_participant_ids(self, value):
        from apps.users.models import User
        users = User.objects.filter(id__in=value, is_active=True)
        if users.count() != len(value):
            raise serializers.ValidationError("Certains utilisateurs sont introuvables")
        return value
    
    def create(self, validated_data):
        from django.db import transaction
        from apps.users.models import User
        from django.db.models import Q, Count
        
        user = self.context['request'].user
        participant_ids = validated_data['participant_ids']
        initial_message = validated_data['initial_message']
        
        # Construire la liste complète des participants (créateur + autres)
        all_participant_ids = set(participant_ids)
        all_participant_ids.add(user.id)
        
        # Chercher une conversation existante avec exactement ces participants
        # Une conversation est considérée comme existante si elle a les mêmes participants actifs
        existing_conversation = None
        
        # Trouver les conversations où l'utilisateur est participant
        potential_conversations = Conversation.objects.filter(
            participants__user=user,
            participants__is_active=True,
            is_active=True
        ).annotate(
            participant_count=Count('participants', filter=Q(participants__is_active=True))
        ).filter(
            participant_count=len(all_participant_ids)
        )
        
        # Vérifier si une conversation a exactement les mêmes participants
        for conv in potential_conversations:
            conv_participant_ids = set(
                conv.participants.filter(is_active=True).values_list('user_id', flat=True)
            )
            if conv_participant_ids == all_participant_ids:
                existing_conversation = conv
                break
        
        # Si une conversation existe, ajouter le message à celle-ci
        if existing_conversation:
            with transaction.atomic():
                message = Message.objects.create(
                    conversation=existing_conversation,
                    sender=user
                )
                
                MessageContent.objects.create(
                    message=message,
                    content=initial_message
                )
                
                existing_conversation.last_message_at = message.created_at
                existing_conversation.save()
            
            return existing_conversation
        
        # Sinon, créer une nouvelle conversation
        with transaction.atomic():
            conversation = Conversation.objects.create()
            
            # Ajouter créateur
            ConversationParticipant.objects.create(
                conversation=conversation,
                user=user
            )
            
            # Ajouter participants (en évitant le créateur et les doublons)
            unique_participant_ids = set(participant_ids)
            if user.id in unique_participant_ids:
                unique_participant_ids.remove(user.id)
                
            for pid in unique_participant_ids:
                participant = User.objects.get(id=pid)
                ConversationParticipant.objects.create(
                    conversation=conversation,
                    user=participant
                )
            
            # Premier message
            message = Message.objects.create(
                conversation=conversation,
                sender=user
            )
            
            MessageContent.objects.create(
                message=message,
                content=initial_message
            )
            
            conversation.last_message_at = message.created_at
            conversation.save()
        
        return conversation


"""
==============================================
SERIALIZERS PART 2 - FORUM, GAMIFICATION, MESSAGING
==============================================
"""

# ============================================
# apps/forum/serializers.py
# ============================================
from rest_framework import serializers
from apps.forum.models import (
    Question, QuestionTitle, QuestionContent, QuestionTag, QuestionVote,
    Answer, AnswerContent, AnswerVote
)
from apps.users.serializers import UserSerializer
from apps.core.serializers import HashIdField

class QuestionSerializer(serializers.ModelSerializer):
    id = HashIdField(read_only=True)
    author = UserSerializer(read_only=True)
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    answers_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'author', 'title', 'content', 'tags', 'votes',
            'is_solved', 'views_count', 'answers_count', 'user_vote',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'votes', 'views_count', 'created_at']
    
    def get_title(self, obj):
        title = obj.titles.filter(is_current=True).first()
        return title.title if title else None
    
    def get_content(self, obj):
        content = obj.contents.filter(is_current=True).first()
        return content.content if content else None
    
    def get_tags(self, obj):
        return [t.tag for t in obj.tags.filter(is_active=True)]
    
    def get_answers_count(self, obj):
        return obj.answers.filter(is_active=True).count()
    
    def get_user_vote(self, obj):
        """Vote de l'utilisateur actuel"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.user_votes.filter(
                user=request.user,
                is_active=True
            ).first()
            return vote.vote_type if vote else None
        return None

class QuestionCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    content = serializers.CharField()
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        default=list
    )
    
    def create(self, validated_data):
        from django.db import transaction
        from django.conf import settings
        
        user = self.context['request'].user
        tags = validated_data.pop('tags', [])
        
        with transaction.atomic():
            # Récupérer le profil actuel
            profile = user.profiles.filter(is_current=True).first()
            if not profile:
                raise serializers.ValidationError("Profil utilisateur introuvable")
            
            # Créer la question
            question = Question.objects.create(
                author=user,
                profile=profile
            )
            
            # Créer titre et contenu
            QuestionTitle.objects.create(
                question=question,
                title=validated_data['title']
            )
            
            QuestionContent.objects.create(
                question=question,
                content=validated_data['content']
            )
            
            # Ajouter tags
            for tag in tags:
                QuestionTag.objects.create(question=question, tag=tag.lower())
            
            # Attribution de points
            user.add_points(
                settings.GAMIFICATION_POINTS['QUESTION_POSTED'],
                'question_posted'
            )
            
            # Vérifier badges
            from apps.gamification.services import BadgeService
            BadgeService.check_and_award_badges(user)
        
        return question

class QuestionUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    content = serializers.CharField(required=False)
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    is_solved = serializers.BooleanField(required=False)
    
    def update(self, instance, validated_data):
        from django.db import transaction
        
        with transaction.atomic():
            if 'title' in validated_data:
                QuestionTitle.objects.create(
                    question=instance,
                    title=validated_data['title']
                )
            
            if 'content' in validated_data:
                QuestionContent.objects.create(
                    question=instance,
                    content=validated_data['content']
                )
            
            if 'tags' in validated_data:
                instance.tags.filter(is_active=True).update(is_active=False)
                for tag in validated_data['tags']:
                    QuestionTag.objects.create(
                        question=instance,
                        tag=tag.lower()
                    )
            
            if 'is_solved' in validated_data:
                from apps.forum.models import QuestionStatusHistory
                instance.is_solved = validated_data['is_solved']
                instance.save()
                
                QuestionStatusHistory.objects.create(
                    question=instance,
                    is_solved=validated_data['is_solved'],
                    changed_by=self.context['request'].user
                )
        
        return instance

class AnswerSerializer(serializers.ModelSerializer):
    id = HashIdField(read_only=True)
    question = HashIdField(source='question_id', read_only=True)
    author = UserSerializer(read_only=True)
    content = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = [
            'id', 'question', 'author', 'content', 'votes', 'is_accepted',
            'user_vote', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'question', 'author', 'votes', 'is_accepted', 'created_at']
    
    def get_content(self, obj):
        content = obj.contents.filter(is_current=True).first()
        return content.content if content else None
    
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.user_votes.filter(
                user=request.user,
                is_active=True
            ).first()
            return vote.vote_type if vote else None
        return None

class AnswerCreateSerializer(serializers.Serializer):
    content = serializers.CharField()
    
    def create(self, validated_data):
        from django.db import transaction
        from django.conf import settings
        
        user = self.context['request'].user
        question = self.context['question']
        
        with transaction.atomic():
            profile = user.profiles.filter(is_current=True).first()
            
            answer = Answer.objects.create(
                question=question,
                author=user,
                profile=profile
            )
            
            AnswerContent.objects.create(
                answer=answer,
                content=validated_data['content']
            )
            
            # Attribution de points
            user.add_points(
                settings.GAMIFICATION_POINTS['ANSWER_POSTED'],
                'answer_posted'
            )
            
            # Notification à l'auteur de la question
            from apps.notifications.services import NotificationService
            NotificationService.create_answer_notification(answer)
        
        return answer







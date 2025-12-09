# ============================================
# apps/forum/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db import transaction

from apps.forum.models import Question, Answer, QuestionVote, AnswerVote
from apps.forum.serializers import (
    QuestionSerializer, QuestionCreateSerializer, QuestionUpdateSerializer,
    AnswerSerializer, AnswerCreateSerializer
)
from apps.core.mixins import HashIdMixin

class QuestionViewSet(HashIdMixin, viewsets.ModelViewSet):
    """Gestion des questions du forum"""
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titles__title', 'contents__content', 'tags__tag']
    ordering_fields = ['votes', 'created_at', 'views_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QuestionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return QuestionUpdateSerializer
        return QuestionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtre solved/unsolved
        filter_type = self.request.query_params.get('filter')
        if filter_type == 'solved':
            queryset = queryset.filter(is_solved=True)
        elif filter_type == 'unsolved':
            queryset = queryset.filter(is_solved=False)
        
        # Filtre par tag
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__tag=tag.lower(), tags__is_active=True)
        
        return queryset.distinct()
    
    def create(self, request, *args, **kwargs):
        """Override create to return QuestionSerializer response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.save()
        
        # Use QuestionSerializer for response
        response_serializer = QuestionSerializer(question, context={'request': request})
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Incrémenter les vues"""
        instance = self.get_object()
        
        # Enregistrer la vue
        from apps.forum.models import QuestionView
        QuestionView.objects.create(
            question=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Incrémenter le compteur
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        """POST /api/questions/{id}/vote/"""
        question = self.get_object()
        vote_type = request.data.get('vote_type', 1)  # 1 ou -1
        
        if vote_type not in [1, -1]:
            return Response(
                {'error': 'vote_type doit être 1 ou -1'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Vérifier si vote existe déjà
            existing_vote = QuestionVote.objects.filter(
                question=question,
                user=request.user,
                is_active=True
            ).first()
            
            if existing_vote:
                if existing_vote.vote_type == vote_type:
                    # Annuler le vote
                    existing_vote.delete(hard=False)
                    question.votes -= vote_type
                else:
                    # Changer le vote
                    question.votes -= existing_vote.vote_type
                    existing_vote.vote_type = vote_type
                    existing_vote.save()
                    question.votes += vote_type
            else:
                # Nouveau vote
                QuestionVote.objects.create(
                    question=question,
                    user=request.user,
                    vote_type=vote_type
                )
                question.votes += vote_type
                
                # Attribution de points à l'auteur si upvote
                if vote_type == 1:
                    from django.conf import settings
                    question.author.add_points(
                        settings.GAMIFICATION_POINTS.get('ANSWER_UPVOTED', 5),
                        'question_upvoted'
                    )
            
            question.save(update_fields=['votes'])
        
        return Response({'votes': question.votes})
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def answers(self, request, pk=None):
        """GET/POST /api/questions/{id}/answers/"""
        question = self.get_object()
        
        if request.method == 'GET':
            answers = question.answers.filter(is_active=True)
            serializer = AnswerSerializer(
                answers,
                many=True,
                context={'request': request}
            )
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = AnswerCreateSerializer(
                data=request.data,
                context={'request': request, 'question': question}
            )
            serializer.is_valid(raise_exception=True)
            answer = serializer.save()
            
            # AI Auto-Resolution
            try:
                from django.conf import settings
                if settings.GEMINI_API_KEY:
                    # Récupérer le contenu de la question
                    q_title = question.titles.filter(is_current=True).first()
                    q_content = question.contents.filter(is_current=True).first()
                    
                    question_text = f"{q_title.title if q_title else ''}\n{q_content.content if q_content else ''}"
                    
                    # Récupérer le contenu de la réponse
                    a_content = answer.contents.filter(is_current=True).first()
                    answer_text = a_content.content if a_content else ""
                    
                    if self._evaluate_answer(question_text, answer_text):
                        question.is_solved = True
                        question.save(update_fields=['is_solved'])
                        
                        # Historique
                        from apps.forum.models import QuestionStatusHistory
                        QuestionStatusHistory.objects.create(
                            question=question,
                            is_solved=True,
                            changed_by=request.user
                        )
            except Exception as e:
                print(f"Auto-resolution error: {e}")
            
            return Response(
                AnswerSerializer(answer, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )

    def _evaluate_answer(self, question_text, answer_text):
        """Évalue si la réponse résout la question via Gemini"""
        from google import genai
        from django.conf import settings
        
        if not settings.GEMINI_API_KEY:
            return False
            
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            prompt = f"""
            Tu es un expert pédagogique.
            
            Question: {question_text}
            
            Réponse proposée: {answer_text}
            
            Cette réponse résout-elle COMPLÈTEMENT et CORRECTEMENT la question posée ?
            Réponds UNIQUEMENT par 'OUI' ou 'NON'.
            """
            
            response = client.models.generate_content(
                model="gemini-2.5-flash", contents=prompt
            )
            
            result = response.text.strip().upper()
            return "OUI" in result
            
        except Exception as e:
            print(f"Erreur évaluation IA: {e}")
            return False


class AnswerViewSet(HashIdMixin, viewsets.GenericViewSet):
    """Actions sur les réponses"""
    permission_classes = [IsAuthenticated]
    queryset = Answer.objects.filter(is_active=True)
    serializer_class = AnswerSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        """POST /api/answers/{id}/vote/"""
        answer = self.get_object()
        vote_type = request.data.get('vote_type', 1)
        
        if vote_type not in [1, -1]:
            return Response(
                {'error': 'vote_type doit être 1 ou -1'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            existing_vote = AnswerVote.objects.filter(
                answer=answer,
                user=request.user,
                is_active=True
            ).first()
            
            if existing_vote:
                if existing_vote.vote_type == vote_type:
                    existing_vote.delete(hard=False)
                    answer.votes -= vote_type
                else:
                    answer.votes -= existing_vote.vote_type
                    existing_vote.vote_type = vote_type
                    existing_vote.save()
                    answer.votes += vote_type
            else:
                AnswerVote.objects.create(
                    answer=answer,
                    user=request.user,
                    vote_type=vote_type
                )
                answer.votes += vote_type
                
                if vote_type == 1:
                    from django.conf import settings
                    answer.author.add_points(
                        settings.GAMIFICATION_POINTS.get('ANSWER_UPVOTED', 5),
                        'answer_upvoted'
                    )
            
            answer.save(update_fields=['votes'])
        
        return Response({'votes': answer.votes})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        """POST /api/answers/{id}/accept/"""
        answer = self.get_object()
        question = answer.question
        
        # Vérifier que c'est l'auteur de la question
        if question.author != request.user:
            return Response(
                {'error': 'Seul l\'auteur peut accepter une réponse'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        with transaction.atomic():
            from apps.forum.models import AnswerAcceptance
            from django.conf import settings
            
            # Désactiver les autres acceptations
            question.answers.filter(is_accepted=True).update(is_accepted=False)
            
            # Accepter cette réponse
            answer.is_accepted = True
            answer.save()
            
            AnswerAcceptance.objects.create(
                answer=answer,
                accepted_by=request.user
            )
            
            # Marquer la question comme résolue
            question.is_solved = True
            question.save()
            
            # Attribution de points à l'auteur de la réponse
            answer.author.add_points(
                settings.GAMIFICATION_POINTS['ANSWER_ACCEPTED'],
                'answer_accepted'
            )
        
        return Response({'message': 'Réponse acceptée'})


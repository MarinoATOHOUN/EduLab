# ============================================
# apps/ai_tools/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

from apps.ai_tools.serializers import (
    AITutorRequestSerializer, AITutorResponseSerializer
)

class AIToolsViewSet(viewsets.GenericViewSet):
    """Outils IA"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def tutor(self, request):
        """POST /api/ai/tutor/ - Proxy vers l'API Gemini/OpenAI"""
        serializer = AITutorRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        question = serializer.validated_data['question']
        subject = serializer.validated_data.get('subject', '')
        level = serializer.validated_data.get('level', '')
        style = serializer.validated_data.get('style', '')
        
        try:
            # Utiliser Gemini si disponible, sinon OpenAI
            if settings.GEMINI_API_KEY:
                answer, tokens = self._call_gemini(question, subject, level, style)
            elif settings.OPENAI_API_KEY:
                answer, tokens = self._call_openai(question, subject, level, style)
            else:
                return Response(
                    {'error': 'Aucune API IA configurée'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Sauvegarder dans l'historique
            from apps.ai_tools.models import AITutorSession, AITutorQuestion
            from django.utils import timezone
            import time
            
            start_time = time.time()
            
            session = AITutorSession.objects.create(
                user=request.user,
                subject=subject,
                level=level
            )
            
            AITutorQuestion.objects.create(
                session=session,
                question=question,
                answer=answer,
                model_used='gemini' if settings.GEMINI_API_KEY else 'openai',
                tokens_used=tokens,
                response_time=time.time() - start_time
            )
            
            session.total_questions += 1
            session.save()
            
            response_serializer = AITutorResponseSerializer({
                'answer': answer,
                'session_id': session.id,
                'tokens_used': tokens
            })
            
            return Response(response_serializer.data)
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"GEMINI ERROR: {error_details}")  # Pour les logs
            
            return Response(
                {
                    'error': str(e),
                    'details': 'Vérifiez que votre clé API Gemini est valide et configurée dans GEMINI_API_KEY',
                    'type': type(e).__name__
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """GET /api/ai/history/ - Récupérer l'historique des sessions"""
        from apps.ai_tools.models import AITutorSession
        
        sessions = AITutorSession.objects.filter(
            user=request.user,
            is_active=True
        ).prefetch_related('questions')[:20]  # Dernières 20 sessions
        
        sessions_data = []
        for session in sessions:
            questions_list = list(session.questions.all())
            sessions_data.append({
                'id': session.id,
                'subject': session.subject,
                'level': session.level,
                'total_questions': session.total_questions,
                'created_at': session.created_at.isoformat(),
                'first_question': questions_list[0].question if questions_list else '',
                'questions': [
                    {
                        'question': q.question,
                        'answer': q.answer,
                        'created_at': q.created_at.isoformat()
                    } for q in questions_list
                ]
            })
        
        return Response(sessions_data)
    
    def _call_gemini(self, question, subject, level, style=''):
        """Appel à l'API Gemini"""
        from google import genai
        from django.conf import settings
        
        # Le client récupère la clé API depuis settings ou variable d'environnement
        # Ici on passe explicitement la clé si elle est dans settings
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Construction du prompt avec tous les paramètres
        style_instruction = ""
        if style:
            if "Simple" in style or "Concis" in style:
                style_instruction = "Sois concis et va droit au but. Utilise un langage simple."
            elif "Détaillé" in style or "Académique" in style:
                style_instruction = "Fournis une explication détaillée et académique avec des références théoriques."
            elif "5 ans" in style or "ELI5" in style:
                style_instruction = "Explique comme si tu parlais à un enfant de 5 ans. Utilise des analogies simples et amusantes."
            elif "Pratique" in style or "Exemples" in style:
                style_instruction = "Concentre-toi sur des exemples pratiques et concrets. Montre comment appliquer les concepts."
            elif "Socratique" in style:
                style_instruction = "Utilise la méthode socratique : pose des questions pour guider l'étudiant vers la réponse."
        
        prompt = f"""Tu es un tuteur pédagogique bienveillant et patient pour EduLab Africa.
L'étudiant est basé en Afrique.

Contexte:
Matière: {subject if subject else 'Général'}
Niveau: {level if level else 'Adapté'}
{f'Style: {style_instruction}' if style_instruction else ''}

Question de l'étudiant: {question}

Réponds de manière claire, structurée et pédagogique. Utilise des exemples culturellement pertinents pour un étudiant africain si possible.

IMPORTANT - Formatage des formules :
- Pour les formules mathématiques inline (dans le texte), utilise la syntaxe : $formule$
  Exemple: La formule $E = mc^2$ est célèbre
- Pour les formules mathématiques en bloc (centrées), utilise : $$formule$$
  Exemple: $$\\int_{{a}}^{{b}} x^2 dx = \\frac{{b^3 - a^3}}{{3}}$$
- Pour les formules chimiques, utilise aussi $ : $H_2O$, $CO_2$, $C_6H_{{12}}O_6$
- Pour les équations chimiques : $$CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$$
- Utilise TOUJOURS cette syntaxe LaTeX pour TOUTES les formules mathématiques et chimiques
"""
        
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )
        
        # Estimation des tokens (approximatif)
        tokens = len(prompt.split()) + len(response.text.split())
        
        return response.text, tokens
    
    
    def _call_openai(self, question, subject, level, style=''):
        """Appel à l'API OpenAI"""
        import openai
        from django.conf import settings
        
        openai.api_key = settings.OPENAI_API_KEY
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"Tu es un tuteur pédagogique pour la matière {subject} au niveau {level}."
                },
                {
                    "role": "user",
                    "content": question
                }
            ]
        )
        
        answer = response.choices[0].message.content
        tokens = response.usage.total_tokens
        
        return answer, tokens



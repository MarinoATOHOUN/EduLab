# ============================================
# apps/mentors/services.py - Services Mentors
# ============================================
import os
import logging
import json
import re
from pypdf import PdfReader
from google import genai
from django.conf import settings
from .models import MentorApplication

logger = logging.getLogger(__name__)

class MentorAIRewiewService:
    @staticmethod
    def extract_text_from_pdf(pdf_path):
        """Extrait le texte d'un fichier PDF"""
        try:
            if not os.path.exists(pdf_path):
                logger.error(f"Fichier PDF non trouvé: {pdf_path}")
                return ""
                
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction du PDF: {str(e)}")
            return ""

    @staticmethod
    def review_application(application_id):
        """Analyse une candidature avec l'IA"""
        try:
            application = MentorApplication.objects.get(id=application_id)
            application.ai_status = 'PROCESSING'
            application.save(update_fields=['ai_status'])

            # Extraction du texte du CV
            cv_text = ""
            if application.cv_file:
                cv_text = MentorAIRewiewService.extract_text_from_pdf(application.cv_file.path)

            # Récupérer le nom de l'utilisateur
            user_name = "Inconnu"
            profile = application.user.profiles.filter(is_current=True).first()
            if profile:
                user_name = profile.name

            # Préparation du prompt
            prompt = f"""
            Tu es un expert en recrutement académique pour EduLab Africa. 
            Ta mission est d'analyser la candidature d'un utilisateur qui souhaite devenir Mentor sur notre plateforme.
            
            Voici les informations de la candidature :
            - Nom : {user_name}
            - Université : {application.university}
            - Spécialités : {', '.join(application.specialties)}
            - Biographie : {application.bio}
            - LinkedIn : {application.linkedin}
            
            Texte extrait du CV (PDF) :
            ---
            {cv_text[:4000]}
            ---
            
            Analyse cette candidature selon les critères suivants :
            1. Expertise technique dans les spécialités mentionnées.
            2. Expérience académique ou professionnelle pertinente.
            3. Capacité à transmettre des connaissances (pédagogie).
            4. Cohérence globale du profil.
            
            Réponds UNIQUEMENT au format JSON suivant (sans texte avant ou après) :
            {{
                "score": (un entier entre 0 et 100),
                "recommendation": "Un résumé détaillé de ton analyse en français et pourquoi tu valides ou non le profil.",
                "validated": (true ou false)
            }}
            """

            # Appel à Gemini via le nouveau SDK (comme dans Tutor AI)
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY non configurée dans les settings.")
                
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            response = client.models.generate_content(
                model='gemini-flash-latest', 
                contents=prompt
            )
            
            # Parser la réponse
            text_response = response.text
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
            
            if json_match:
                result = json.loads(json_match.group())
                
                application.ai_score = result.get('score', 0)
                application.ai_recommendation = result.get('recommendation', '')
                application.ai_validated = result.get('validated', False)
                application.ai_status = 'COMPLETED'
            else:
                application.ai_status = 'FAILED'
                application.ai_recommendation = "L'IA n'a pas renvoyé un format JSON valide."
            
            application.save()
            return True

        except Exception as e:
            logger.error(f"Erreur lors de l'analyse IA: {str(e)}")
            try:
                # Re-fetch application to avoid stale data if needed
                app = MentorApplication.objects.get(id=application_id)
                app.ai_status = 'FAILED'
                app.ai_recommendation = f"Erreur technique: {str(e)}"
                app.save()
            except:
                pass
            return False

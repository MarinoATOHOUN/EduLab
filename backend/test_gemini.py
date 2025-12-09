#!/usr/bin/env python3
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educonnect.settings')
django.setup()

from django.conf import settings
from google import genai

print(f"GEMINI_API_KEY configurée: {bool(settings.GEMINI_API_KEY)}")
print(f"Longueur de la clé: {len(settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else 0}")

try:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    print("Client créé avec succès")
    
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents="Test simple: dis bonjour"
    )
    print(f"Réponse: {response.text}")
except Exception as e:
    print(f"ERREUR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

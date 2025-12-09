from django.conf import settings
from google import genai

print(f"GEMINI_API_KEY: {settings.GEMINI_API_KEY[:10]}..." if settings.GEMINI_API_KEY else "Non configurée")

try:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents="Dis bonjour en une phrase"
    )
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")

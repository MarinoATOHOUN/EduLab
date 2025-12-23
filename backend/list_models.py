from google import genai
import os
from decouple import config

def list_models():
    api_key = config('GEMINI_API_KEY', default='')
    if not api_key:
        print("GEMINI_API_KEY not found")
        return
    
    client = genai.Client(api_key=api_key)
    try:
        print("Listing models...")
        for model in client.models.list():
            if 'generateContent' in model.supported_actions:
                print(f"Model: {model.name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()

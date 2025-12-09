
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educonnect.settings')
django.setup()

from apps.core.models import Testimonial

TESTIMONIALS = [
  {
    'name': "Aminata S.",
    'country': "Sénégal",
    'text': "Dans mon université, on n'a pas de labo. Le simulateur de chimie d'EduLab m'a permis de comprendre enfin les réactions que j'apprenais par cœur.",
    'role': "Étudiante en Chimie",
    'order': 1
  },
  {
    'name': "Kofi A.",
    'country': "Ghana",
    'text': "Je codais sur papier... Avec le bac à sable intégré, j'ai pu tester mes premiers scripts Python directement. C'est ça l'Afrique qui bouge !",
    'role': "Étudiant en Informatique",
    'order': 2
  },
  {
    'name': "Sarah M.",
    'country': "Kenya",
    'text': "La communauté m'a aidé à voir comment les maths s'appliquent dans l'ingénierie réelle. Merci Hypee pour cette plateforme.",
    'role': "Lycéenne",
    'order': 3
  }
]

for t_data in TESTIMONIALS:
    Testimonial.objects.update_or_create(
        name=t_data['name'],
        defaults=t_data
    )

print("Testimonials created/updated successfully.")

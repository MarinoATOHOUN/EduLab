
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educonnect.settings')
django.setup()

from apps.core.models import LearningTool

TOOLS = [
  {
    'tool_id': 'calc',
    'title': "Calculatrice Scientifique",
    'description': "Plus besoin d'acheter une calculatrice coûteuse. Résolvez des équations complexes et tracez des graphiques gratuitement.",
    'icon': 'Calculator',
    'category': 'Sciences',
    'level': 'Lycée',
    'color': 'bg-blue-100 dark:bg-blue-900/30',
    'text_color': 'text-blue-600 dark:text-blue-400',
    'bg_gradient': 'from-blue-500 to-cyan-400',
    'status': 'available',
    'link': '/tools/calculator',
    'order': 1
  },
  {
    'tool_id': 'chem',
    'title': "Laboratoire Chimique",
    'description': "Votre école n'a pas de labo ? Mélangez des éléments virtuels et observez les réactions sans aucun danger ici.",
    'icon': 'FlaskConical',
    'category': 'Sciences',
    'level': 'Collège',
    'color': 'bg-green-100 dark:bg-green-900/30',
    'text_color': 'text-green-600 dark:text-green-400',
    'bg_gradient': 'from-green-500 to-emerald-400',
    'status': 'available',
    'link': '',
    'order': 2
  },
  {
    'tool_id': 'write',
    'title': "Atelier d'écriture Junior",
    'description': "Améliorez votre style avec des suggestions de synonymes, des corrections grammaticales et des idées d'histoires.",
    'icon': 'PenTool',
    'category': 'Langues',
    'level': 'Primaire',
    'color': 'bg-orange-100 dark:bg-orange-900/30',
    'text_color': 'text-orange-600 dark:text-orange-400',
    'bg_gradient': 'from-orange-500 to-amber-400',
    'status': 'available',
    'link': '/tools/writing',
    'order': 3
  },
  {
    'tool_id': 'art',
    'title': "Atelier de Coloriage",
    'description': "Exprimez votre créativité avec notre studio d'art numérique. Apprenez la théorie des couleurs en vous amusant.",
    'icon': 'Palette',
    'category': 'Créativité',
    'level': 'Primaire',
    'color': 'bg-purple-100 dark:bg-purple-900/30',
    'text_color': 'text-purple-600 dark:text-purple-400',
    'bg_gradient': 'from-purple-500 to-pink-400',
    'status': 'available',
    'link': '/tools/coloring',
    'order': 4
  },
  {
    'tool_id': 'code',
    'title': "Bac à Sable Code",
    'description': "Pas d'ordinateur puissant ? Apprenez le Python et le JS directement dans votre navigateur, sans installation.",
    'icon': 'Code',
    'category': 'Informatique',
    'level': 'Lycée',
    'color': 'bg-gray-100 dark:bg-gray-800',
    'text_color': 'text-gray-700 dark:text-gray-300',
    'bg_gradient': 'from-gray-600 to-gray-400',
    'status': 'available',
    'link': '/tools/code-sandbox',
    'order': 5
  },
  {
    'tool_id': 'bio',
    'title': "Microscope Virtuel",
    'description': "Explorez l'infiniment petit. Observez des cellules végétales et animales comme si vous aviez un vrai microscope.",
    'icon': 'Microscope',
    'category': 'Sciences',
    'level': 'Collège',
    'color': 'bg-teal-100 dark:bg-teal-900/30',
    'text_color': 'text-teal-600 dark:text-teal-400',
    'bg_gradient': 'from-teal-500 to-green-400',
    'status': 'dev',
    'link': '',
    'order': 6
  },
  {
    'tool_id': 'geo',
    'title': "Atlas Interactif",
    'description': "Voyagez à travers l'Afrique et le monde. Découvrez la géographie, les climats et les cultures.",
    'icon': 'Globe',
    'category': 'Sciences',
    'level': 'Tous niveaux',
    'color': 'bg-indigo-100 dark:bg-indigo-900/30',
    'text_color': 'text-indigo-600 dark:text-indigo-400',
    'bg_gradient': 'from-indigo-500 to-blue-400',
    'status': 'available',
    'link': '/tools/atlas',
    'order': 7
  },
  {
    'tool_id': 'music',
    'title': "Studio Musique",
    'description': "Composez vos propres rythmes et découvrez les instruments traditionnels africains.",
    'icon': 'Music',
    'category': 'Créativité',
    'level': 'Tous niveaux',
    'color': 'bg-red-100 dark:bg-red-900/30',
    'text_color': 'text-red-600 dark:text-red-400',
    'bg_gradient': 'from-red-500 to-rose-400',
    'status': 'dev',
    'link': '',
    'order': 8
  }
]

for tool_data in TOOLS:
    LearningTool.objects.update_or_create(
        tool_id=tool_data['tool_id'],
        defaults=tool_data
    )

print("Tools created/updated successfully.")

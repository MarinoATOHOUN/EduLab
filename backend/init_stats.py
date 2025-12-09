
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educonnect.settings')
django.setup()

from apps.core.models import ImpactStat

if not ImpactStat.objects.exists():
    ImpactStat.objects.create(title='Étudiants Actifs', value='2.5k+', icon='Users', order=1)
    ImpactStat.objects.create(title='Problèmes Résolus', value='850+', icon='CheckCircle', order=2)
    ImpactStat.objects.create(title='Mentors Experts', value='120+', icon='Award', order=3)
    ImpactStat.objects.create(title='Outils Pratiques', value='15+', icon='Wrench', order=4)
    print("Stats created successfully.")
else:
    print("Stats already exist.")

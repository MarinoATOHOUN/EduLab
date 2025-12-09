
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educonnect.settings')
django.setup()

from apps.core.models import SocialLink

SOCIALS = [
    {'platform': 'facebook', 'name': 'Facebook', 'url': 'https://facebook.com', 'icon': 'Facebook', 'order': 1},
    {'platform': 'twitter', 'name': 'Twitter', 'url': 'https://twitter.com', 'icon': 'Twitter', 'order': 2},
    {'platform': 'linkedin', 'name': 'LinkedIn', 'url': 'https://linkedin.com', 'icon': 'Linkedin', 'order': 3},
]

for s_data in SOCIALS:
    SocialLink.objects.update_or_create(
        platform=s_data['platform'],
        defaults=s_data
    )

print("Social links created/updated successfully.")

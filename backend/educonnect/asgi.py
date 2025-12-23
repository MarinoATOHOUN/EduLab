import os
import django
from django.core.asgi import get_asgi_application

# Définir les paramètres Django avant tout import d'application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educonnect.settings')

# Initialiser Django
django_asgi_app = get_asgi_application()

# Maintenant on peut importer le reste
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from apps.messaging.consumers import ChatConsumer
from apps.notifications.consumers import NotificationConsumer
from educonnect.middleware import JwtAuthMiddleware

websocket_urlpatterns = [
    path('ws/chat/<str:conversation_id>/', ChatConsumer.as_asgi()),
    path('ws/notifications/', NotificationConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})

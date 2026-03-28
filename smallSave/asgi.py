"""
ASGI config for smallSave project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

# Set Django settings BEFORE importing Django modules
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smallSave.settings")

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import smallSave.urls

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": URLRouter(smallSave.urls.websocket_urlpatterns),
    },
)

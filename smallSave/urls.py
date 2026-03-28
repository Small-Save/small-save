"""
URL configuration for smallSave project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

import django
from django.contrib import admin
from django.urls import include, path, re_path

from .consumer import BiddingConsumer

# Ensure Django is setup before accessing admin.site
if not django.apps.apps.ready:
    django.setup()

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("Authentication.urls")),
    path("groups/", include("Groups.urls")),
    path("bidding/", include("Bidding.urls")),
    path("payments/", include("Payment.urls")),
]


websocket_urlpatterns = [
    re_path(r"ws/bidding/(?P<round_id>\w+)/$", BiddingConsumer.as_asgi()),
]

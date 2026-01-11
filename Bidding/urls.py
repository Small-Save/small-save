# urls.py (example integration)
from django.urls import path
from Bidding.views import bidding_room

urlpatterns = [
    path("bidding/<int:round_id>/", bidding_room, name="bidding-room"),
]

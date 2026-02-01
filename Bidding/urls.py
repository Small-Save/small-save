# urls.py (example integration)
from django.urls import path

from Bidding.views import bidding_room
from Bidding.views import end_bidding
from Bidding.views import get_bidding_status
from Bidding.views import place_bid
from Bidding.views import start_bidding

urlpatterns = [
    path("<int:round_id>/", bidding_room, name="bidding-room"),
    path("<int:round_id>/start/", start_bidding, name="start-bidding"),
    path("<int:round_id>/place-bid/", place_bid, name="place-bid"),
    path("<int:round_id>/status/", get_bidding_status, name="biddding-status"),
    path("<int:round_id>/end/", end_bidding, name="end-bidding"),
]

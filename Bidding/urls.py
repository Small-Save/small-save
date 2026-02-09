# urls.py (example integration)
from django.conf import settings
from django.urls import path

from Bidding.views import bidding_room
from Bidding.views import end_bidding
from Bidding.views import get_bidding_status
from Bidding.views import make_bidding_active
from Bidding.views import place_bid
from Bidding.views import start_bidding

urlpatterns = [
    path("<int:round_id>/", bidding_room, name="bidding_room"),
    path("<int:round_id>/start/", start_bidding, name="start_bidding"),
    path("<int:round_id>/place_bid/", place_bid, name="place_bid"),
    path("<int:round_id>/status/", get_bidding_status, name="biddding_status"),
    path("<int:round_id>/end/", end_bidding, name="end_bidding"),
]

if settings.DEBUG:
    urlpatterns += [path("<int:round_id>/make_biddding_active/", make_bidding_active, name="make_bidding_active" )]

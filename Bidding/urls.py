# urls.py (example integration)
from django.conf import settings
from django.urls import path

from Bidding.views import (
    bidding_room,
    end_bidding,
    get_all_bids,
    make_bidding_active,
    place_bid,
    start_bidding,
)

urlpatterns = [
    path("<int:round_id>/", bidding_room, name="bidding_room"),
    path("<int:round_id>/place_bid/", place_bid, name="place_bid"),
    path("<int:round_id>/bids/all/", get_all_bids, name="get_all_bids"),
]

if settings.DEBUG:
    urlpatterns += [
        path(
            "<int:round_id>/make_biddding_active/",
            make_bidding_active,
            name="make_bidding_active",
        ),
        path("<int:round_id>/start/", start_bidding, name="start_bidding"),
        path("<int:round_id>/end/", end_bidding, name="end_bidding"),
    ]

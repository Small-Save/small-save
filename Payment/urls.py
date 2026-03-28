# payments/urls.py
from django.urls import path

from .views import (
    get_payment_details,
    giver_confirm_payment,
    group_payment_history,
    group_round_payment_status,
    receiver_confirm_payment,
)

urlpatterns = [
    path(
        "<int:payment_id>/giver-confirm/", giver_confirm_payment, name="giver-confirm"
    ),
    path(
        "<int:payment_id>/receiver-confirm/",
        receiver_confirm_payment,
        name="receiver-confirm",
    ),
    path(
        "groups/<int:group_id>/payment-history/",
        group_payment_history,
        name="group-payment-history",
    ),
    path(
        "group/<int:group_id>/round/<int:round_id>/",
        group_round_payment_status,
        name="group-round-payment-status",
    ),
    path("<int:payment_id>/", get_payment_details, name="get_payment_detail"),
]

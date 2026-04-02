# payments/urls.py
from django.urls import path

from .views import (
    get_all_group_payments,
    get_payment_details,
    get_round_payments,
    giver_confirm_payment,
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
        "round/<int:round_id>/",
        get_round_payments,
        name="group-round-payment-status",
    ),
    path("<int:payment_id>/", get_payment_details, name="get_payment_detail"),
    path("<int:group_id>/all/", get_all_group_payments, name="get_all_group_payments"),
]

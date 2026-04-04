# payments/urls.py
from django.urls import path

from .views import (
    confirm_payment_as_giver,
    confirm_payment_as_receiver,
    list_group_payments,
    list_round_payments,
    retrieve_payment,
)

urlpatterns = [
    path(
        "<int:payment_id>/confirm/giver/",
        confirm_payment_as_giver,
        name="payment-confirm-giver",
    ),
    path(
        "<int:payment_id>/confirm/receiver/",
        confirm_payment_as_receiver,
        name="payment-confirm-receiver",
    ),
    path(
        "rounds/<int:round_id>/",
        list_round_payments,
        name="payment-list-by-round",
    ),
    path("<int:payment_id>/", retrieve_payment, name="payment-detail"),
    path("groups/<int:group_id>/", list_group_payments, name="payment-list-by-group"),
]

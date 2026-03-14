# payments/urls.py
from django.urls import path
from .views import (initiate_payments,group_round_payment_status,giver_confirm_payment,receiver_confirm_payment,group_payment_history,get_payment_details)

urlpatterns = [
    path("initiate/",initiate_payments,name="initiate-payment"),
    path('payments/<int:payment_id>/giver-confirm/',giver_confirm_payment, name='giver-confirm'),
    path('payments/<int:payment_id>/receiver-confirm/', receiver_confirm_payment, name='receiver-confirm'),
    path('groups/<int:group_id>/payment-history/', group_payment_history, name='group-payment-history'),
    path("group/<int:group_id>/round/<int:round_id>/",group_round_payment_status ,name="group-round-payment-status"),
    path("<int:payment_id>/",get_payment_details, name="get_payment_detail")
]

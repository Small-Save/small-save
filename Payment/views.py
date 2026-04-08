# payments/views.py
import logging

from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from Bidding.models import BiddingRound
from Groups.models import Group
from Groups.permissions import IsGroupMember
from utils.response import CustomResponse

from .models import Payment
from .serializers import PaymentSerializer

logger = logging.getLogger("api")

User = get_user_model()


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def confirm_payment_as_giver(request, payment_id):
    try:
        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(id=payment_id)

            if payment.giver_id != request.user.id:
                logger.warning(
                    "Unauthorized giver confirmation: user_id=%s payment_id=%s",
                    request.user.id,
                    payment_id,
                )
                return CustomResponse(
                    is_success=False,
                    error="Not authorized",
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            if not payment.is_pending:
                logger.warning(
                    "Invalid state transition: payment_id=%s status=%s",
                    payment_id,
                    payment.status,
                )
                return CustomResponse(
                    is_success=False,
                    error="Invalid payment state",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            payment.mark_giver_confirmed()

            logger.info(
                "Giver confirmed payment: payment_id=%s giver_id=%s",
                payment_id,
                request.user.id,
            )

            from Notifications.models import NotifType
            from Notifications.services import notify_user

            notify_user(
                user=payment.receiver,
                notification_type=NotifType.PAYMENT_CONFIRMED,
                title="Payment confirmed by sender",
                body=f"{request.user.first_name} has confirmed their payment of ₹{payment.amount}.",
                data={"group_id": payment.group_id, "payment_id": payment.id},
            )

            return CustomResponse(
                is_success=True,
                message="Payment confirmed by giver",
                status_code=status.HTTP_200_OK,
            )

    except ObjectDoesNotExist:
        logger.warning("Payment not found: payment_id=%s", payment_id)
        return CustomResponse(
            is_success=False,
            error="Payment not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    except Exception:
        logger.exception("Error in giver confirmation: payment_id=%s", payment_id)
        return CustomResponse(
            is_success=False,
            error="Something went wrong",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def confirm_payment_as_receiver(request, payment_id):
    try:
        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(id=payment_id)

            # Ensure the requesting user is actually the receiver
            if payment.receiver_id != request.user.id:
                logger.warning(
                    "Unauthorized receiver confirmation: user_id=%s payment_id=%s",
                    request.user.id,
                    payment_id,
                )
                return CustomResponse(
                    is_success=False,
                    error="Not authorized",
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            if not payment.is_giver_confirmed:
                logger.warning(
                    "Receiver confirm blocked: payment_id=%s status=%s",
                    payment_id,
                    payment.status,
                )
                return CustomResponse(
                    is_success=False,
                    error="Giver has not confirmed yet",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            payment.mark_completed()

            logger.info(
                "Payment completed: payment_id=%s receiver_id=%s",
                payment_id,
                request.user.id,
            )

            from Notifications.models import NotifType
            from Notifications.services import notify_user

            notify_user(
                user=payment.giver,
                notification_type=NotifType.PAYMENT_CONFIRMED,
                title="Payment completed",
                body=f"{request.user.first_name} confirmed receipt of your ₹{payment.amount} payment.",
                data={"group_id": payment.group_id, "payment_id": payment.id},
            )

            return CustomResponse(
                is_success=True,
                message="Payment completed",
                status_code=status.HTTP_200_OK,
            )

    except ObjectDoesNotExist:
        logger.warning("Payment not found: payment_id=%s", payment_id)
        return CustomResponse(
            is_success=False,
            error="Payment not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    except Exception:
        logger.exception("Error in receiver confirmation: payment_id=%s", payment_id)
        return CustomResponse(
            is_success=False,
            error="Something went wrong",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_group_payments(request, group_id):
    """
    Fetch all payments for a specific group.
    """
    group = get_object_or_404(Group, id=group_id)
    permission = IsGroupMember()
    if not permission.has_object_permission(request, None, group):
        logger.warning(
            "Access denied: user_id=%s, group_id=%s",
            request.user.id,
            group.id,
        )
        return CustomResponse(
            is_success=False,
            error="You are not authorized to view payments for this group.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    payments = Payment.objects.filter(group=group).select_related(
        "giver", "receiver", "round"
    )

    data = PaymentSerializer(payments, many=True, context={"request": request}).data

    return CustomResponse(
        is_success=True,
        data=data,
        message="Group payments fetched successfully.",
        status_code=status.HTTP_200_OK,
    )


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_round_payments(request, round_id):
    """
    Fetch payment status of all members in a specific group and round.
    """
    bidding_round = get_object_or_404(
        BiddingRound.objects.select_related("group"), id=round_id
    )
    permission = IsGroupMember()
    if not permission.has_object_permission(request, None, bidding_round.group):
        logger.warning(
            "Access denied: user_id=%s, group_id=%s",
            request.user.id,
            bidding_round.group_id,
        )
        return CustomResponse(
            is_success=False,
            error="Forbidden",
            message="You are not a member of this group",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    try:
        payments = Payment.objects.filter(
            group=bidding_round.group, round_id=round_id
        ).select_related("giver", "receiver")

        serializer = PaymentSerializer(
            payments, many=True, context={"request": request}
        )
        data = serializer.data

        logger.info(
            "Fetched payment status: group=%s, round=%s, count=%s",
            bidding_round.group_id,
            round_id,
            len(data),
        )

        return CustomResponse(
            is_success=True,
            data=data,
            message="Payment status fetched successfully",
            status_code=status.HTTP_200_OK,
        )

    except Exception:
        logger.exception("Error fetching payment status: round_id=%s", round_id)
        return CustomResponse(
            is_success=False,
            error="Internal server error",
            message="Something went wrong while fetching payment status",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def retrieve_payment(request, payment_id):
    """
    Fetches specific details of a payment by its ID using a serializer.
    """
    try:
        payment = Payment.objects.select_related("group", "giver", "receiver").get(
            id=payment_id
        )

        # Security Check: Ensure the user requesting this is part of the transaction
        if request.user.id not in [payment.giver_id, payment.receiver_id]:
            logger.warning(
                "Unauthorized payment fetch attempt: user_id=%s payment_id=%s",
                request.user.id,
                payment_id,
            )
            return CustomResponse(
                is_success=False,
                error="You do not have permission to view this payment",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        serializer = PaymentSerializer(payment, context={"request": request})

        logger.info(
            "Fetched payment details: payment_id=%s user_id=%s",
            payment_id,
            request.user.id,
        )

        return CustomResponse(
            is_success=True,
            data=serializer.data,
            message="Payment details fetched successfully.",
            status_code=status.HTTP_200_OK,
        )

    except ObjectDoesNotExist:
        logger.warning(
            "Payment not found: payment_id=%s user_id=%s",
            payment_id,
            request.user.id,
        )
        return CustomResponse(
            is_success=False,
            error="Payment not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    except Exception:
        logger.exception(
            "Unexpected error fetching payment: payment_id=%s user_id=%s",
            payment_id,
            request.user.id,
        )
        return CustomResponse(
            is_success=False,
            error="Something went wrong",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

# payments/views.py
import logging
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework import status

from utils.response import CustomResponse
from .models import Payment
from .constants import PaymentStatus
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from .serializers import PaymentStatusSerializer,PaymentDetailSerializer
from Groups.models import Group
from Bidding.models import BiddingRound
from rest_framework_simplejwt.authentication import JWTAuthentication
logger = logging.getLogger("api")

User = get_user_model()
    


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def giver_confirm_payment(request, payment_id):
    try:
        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(id=payment_id)

            # Ensure the requesting user is actually the giver
            if payment.giver_id != request.user.id:
                logger.warning(
                    f"Unauthorized giver confirmation | user={request.user.id} payment={payment_id}"
                )
                return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

            # Enforce state machine: Must be PENDING to move to GIVER_CONFIRMED
            if payment.status != PaymentStatus.PENDING:
                logger.warning(
                    f"Invalid state transition | payment={payment_id} status={payment.status}"
                )
                return Response({"error": "Invalid payment state"}, status=status.HTTP_400_BAD_REQUEST)

            # Hardcoded status update
            payment.status = PaymentStatus.GIVER_CONFIRMED
            payment.save()

            logger.info(
                f"Giver confirmed payment | payment_id={payment_id} giver={request.user.id}"
            )

            return Response({"message": "Payment confirmed by giver"}, status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        logger.warning(f"Payment not found | payment_id={payment_id}")
        return Response(
            {"error": "Payment not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        logger.exception("Error in giver confirmation")
        return Response(
            {"error": "Something went wrong"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def receiver_confirm_payment(request, payment_id):
    try:
        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(id=payment_id)

            # Ensure the requesting user is actually the receiver
            if payment.receiver_id != request.user.id:
                logger.warning(
                    f"Unauthorized receiver confirmation | user={request.user.id} payment={payment_id}"
                )
                return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

            # Enforce state machine: Must be GIVER_CONFIRMED to move to COMPLETED
            if payment.status != PaymentStatus.GIVER_CONFIRMED:
                logger.warning(
                    f"Receiver confirm blocked | payment={payment_id} status={payment.status}"
                )
                return Response(
                    {"error": "Giver has not confirmed yet"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Hardcoded status update
            payment.status = PaymentStatus.COMPLETED
            payment.save()

            logger.info(
                f"Payment completed | payment_id={payment_id} receiver={request.user.id}"
            )

            return Response({"message": "Payment completed"}, status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        logger.warning(f"Payment not found | payment_id={payment_id}")
        return Response(
            {"error": "Payment not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception:
        logger.exception("Error in receiver confirmation")
        return Response(
            {"error": "Something went wrong"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def group_round_payment_status(request, group_id, round_id):
    """
    Fetch payment status of all members in a specific group and round
    """
    try:
        if not Group.objects.filter(id=group_id).exists():
            logger.warning(
                "Invalid group_id",
                extra={"group_id": group_id}
            )
            return CustomResponse(
                is_success=False,
                error="Invalid group",
                message="Group does not exist",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if not BiddingRound.objects.filter(id=round_id).exists():
            logger.warning(
                "Invalid round_id",
                extra={"round_id": round_id}
            )
            return CustomResponse(
                is_success=False,
                error="Invalid round",
                message="Round does not exist",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        payments = Payment.objects.select_related(
            "giver", "receiver"
        ).filter(
            group_id=group_id,
            round_id=round_id
        )

        serializer = PaymentStatusSerializer(payments, many=True)

        logger.info(
            "Fetched group round payment status",
            extra={
                "group_id": group_id,
                "round_id": round_id,
                "payment_count": payments.count()
            }
        )

        return CustomResponse(
            is_success=True,
            data={
                "group_id": group_id,
                "round_id": round_id,
                "payments": serializer.data,
            },
            message="Payment status fetched successfully",
            status_code=status.HTTP_200_OK
        )

    except Exception:
        logger.exception(
            "Failed to fetch group round payment status",
            extra={
                "group_id": group_id,
                "round_id": round_id
            }
        )
        return CustomResponse(
            is_success=False,
            error="Internal server error",
            message="Something went wrong while fetching payment status",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def group_payment_history(request, group_id):
    """
    Fetches scheduled rounds and their winners for a specific group.
    """
    try:
        # 1. Verify the group exists
        try:
            group = Group.objects.get(id=group_id)
        except ObjectDoesNotExist:
            logger.warning(
                f"Group history fetch failed: Group not found | group_id={group_id} user={request.user.id}"
            )
            return CustomResponse(
                is_success=False,
                error="Group not found",
                message=f"Group with id {group_id} not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # 2. Fetch the bidding rounds for this group directly
        # We use select_related('winner__user') to prevent N+1 queries for the winner's username
        rounds = BiddingRound.objects.filter(group=group).select_related('winner__user').order_by('round_number')

        # 3. Construct the rounds list
        rounds_data = []
        for bidding_round in rounds:
            winner_name = None
            if bidding_round.winner and bidding_round.winner.user:
                winner_name = bidding_round.winner.user.username
            
            rounds_data.append({
                "round_number": bidding_round.round_number,
                "winner": winner_name,
                "scheduled_time": bidding_round.scheduled_time.isoformat() if bidding_round.scheduled_time else None,
            })

        # 4. Construct final response
        response_payload = {
            "group_name": getattr(group, 'name', f"Group {group.id}"),
            "rounds": rounds_data,
        }

        logger.info(
            f"Fetched group rounds history | group_id={group_id} user={request.user.id}"
        )

        return CustomResponse(
            is_success=True,
            data=response_payload,
            message="Group payment history fetched successfully.",
            status_code=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.exception(
            f"Unexpected error fetching round history | group_id={group_id} user={request.user.id}"
        )
        return CustomResponse(
            is_success=False,
            error="Internal Server Error",
            message="An unexpected error occurred while fetching the round history.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_payment_details(request, payment_id):
    """
    Fetches specific details of a payment by its ID using a serializer.
    """
    try:
        # We still use select_related to prevent N+1 queries when the serializer looks up names
        payment = Payment.objects.select_related(
            'group', 'giver', 'receiver'
        ).get(id=payment_id)

        # Optional Security Check: Ensure the user requesting this is part of the transaction
        # if request.user.id not in [payment.giver_id, payment.receiver_id]:
        #     logger.warning(
        #         f"Unauthorized payment fetch attempt | user={request.user.id} payment_id={payment_id}"
        #     )
        #     return CustomResponse(
        #         is_success=False,
        #         error="You do not have permission to view this payment",
        #         status=status.HTTP_403_FORBIDDEN
        #     )

        # Pass the instance to the serializer
        serializer = PaymentDetailSerializer(payment)

        logger.info(f"Fetched payment details | payment_id={payment_id} user={request.user.id}")
        
        # Return the strictly defined serializer.data
        return CustomResponse(
            data=serializer.data,
            message="Payment details fetched successfully.",
            status_code=status.HTTP_200_OK,
        )

    except ObjectDoesNotExist:
        logger.warning(f"Payment not found | payment_id={payment_id} user={request.user.id}")
        return CustomResponse(
            is_success=False,
            error="Payment not found",
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        logger.exception(f"Unexpected error fetching payment | payment_id={payment_id} user={request.user.id}")
        return CustomResponse(
            is_success=False,
            error="Something went wrong",
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

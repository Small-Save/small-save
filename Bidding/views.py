import logging

from Authentication.serializers import BaseUserSerializer  # noqa: F401
from django.db import IntegrityError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from Groups.models import GroupMember
from Groups.permissions import IsGroupAdmin
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from utils.response import CustomResponse

from Bidding.models import Bid
from Bidding.models import BiddingRound
from Bidding.models import BiddingRoundStatusEnum
from Bidding.serializers import BiddingRoundSerializer
from Bidding.serializers import BidSerializer

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def bidding_room(request, round_id):
    """Get bidding room details"""
    bidding_round: BiddingRound = get_object_or_404(BiddingRound, id=round_id)

    try:
        member: GroupMember = GroupMember.objects.get(group=bidding_round.group, user=request.user)
    except GroupMember.DoesNotExist:
        logger.warning(
            "Bidding room access denied: user_id=%s is not a member of group_id=%s (round_id=%s)",
            request.user.id,
            bidding_round.group_id,
            round_id,
        )
        return CustomResponse(
            error="You are not a member of this group",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    logger.info(
        "Bidding room accessed: user_id=%s round_id=%s can_bid=%s",
        request.user.id,
        round_id,
        not member.has_won and bidding_round.is_active(),
    )
    return CustomResponse(
        data={
            "bidding_round": BiddingRoundSerializer(bidding_round).data,
            "can_bid": not member.has_won and bidding_round.is_active(),
        },
        message="Bidding room details",
        status_code=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_bid(request, round_id):
    """Handle bid placement"""
    bidding_round: BiddingRound = get_object_or_404(BiddingRound, id=round_id)

    if not bidding_round.is_active():
        logger.warning("Bid rejected: round_id=%s is not active (status=%s)", round_id, bidding_round.status)
        return CustomResponse(is_success=False, error="Bidding is not active", status_code=status.HTTP_400_BAD_REQUEST)

    try:
        member = GroupMember.objects.get(group=bidding_round.group, user=request.user)
    except GroupMember.DoesNotExist:
        logger.warning("Bid rejected: user_id=%s is not a member of group for round_id=%s", request.user.id, round_id)
        return CustomResponse(is_success=False, error="Not a member", status_code=status.HTTP_403_FORBIDDEN)

    if member.has_won:
        logger.warning(
            "Bid rejected: user_id=%s already won a round in group_id=%s", request.user.id, bidding_round.group_id,
        )
        return CustomResponse(is_success=False, error="Already won a round", status_code=status.HTTP_403_FORBIDDEN)

    try:
        bid_amount = int(request.data.get("amount", 0))
    except (ValueError, TypeError):
        logger.warning("Bid rejected: invalid amount from user_id=%s for round_id=%s", request.user.id, round_id)
        return CustomResponse(is_success=False, error="Invalid amount", status_code=status.HTTP_400_BAD_REQUEST)

    if bidding_round.bids.filter(amount=bid_amount).exists():
        logger.info(
            "Bid rejected: duplicate amount=%s for round_id=%s by user_id=%s", bid_amount, round_id, request.user.id,
        )
        return CustomResponse(
            is_success=False,
            error="Bid amount already exists",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if bid_amount <= 0 or bid_amount > int(bidding_round.group.target_amount):
        logger.warning(
            "Bid rejected: amount=%s out of range for round_id=%s (target=%s) by user_id=%s",
            bid_amount,
            round_id,
            bidding_round.group.target_amount,
            request.user.id,
        )
        return CustomResponse(
            is_success=False,
            error="Invalid bid amount. Must be between 0 and group target amount.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            bid = Bid.objects.create(bidding_round=bidding_round, member=member, amount=bid_amount)
    except IntegrityError:
        logger.info(
            "Bid rejected: integrity error (duplicate) amount=%s round_id=%s user_id=%s",
            bid_amount,
            round_id,
            request.user.id,
        )
        return CustomResponse(
            is_success=False,
            error="Bid amount already exists",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    logger.info("Bid placed: bid_id=%s amount=%s round_id=%s user_id=%s", bid.id, bid_amount, round_id, request.user.id)
    return CustomResponse(
        data=BidSerializer(bid).data,
        status_code=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_bids(request, round_id):
    """Get all bids for a bidding round, ordered by amount (lowest/winning first)."""
    bidding_round: BiddingRound = get_object_or_404(BiddingRound, id=round_id)

    if not GroupMember.objects.filter(group=bidding_round.group, user=request.user).exists():
        logger.warning("Bids access denied: user_id=%s not a member for round_id=%s", request.user.id, round_id)
        return CustomResponse(
            error="Not a member of this group",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    try:
        limit = min(int(request.query_params.get("limit", 50)), 100)
    except (ValueError, TypeError):
        limit = 50
    bids = (
        bidding_round.bids.filter(is_valid=True)
        .select_related("member", "member__user")
        .order_by("amount", "timestamp")[:limit]
    )

    logger.debug("Fetched %d bids for round_id=%s by user_id=%s", len(bids), round_id, request.user.id)
    return CustomResponse(
        data=BidSerializer(bids, many=True).data,
        status_code=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_bidding(request, round_id):
    """Start a bidding round (admin only)"""
    bidding_round: BiddingRound = get_object_or_404(BiddingRound, id=round_id)

    permission = IsGroupAdmin()
    if not permission.has_object_permission(request, None, bidding_round.group):
        raise PermissionDenied(permission.message)

    if not bidding_round.can_start():
        logger.warning(
            "Cannot start bidding: round_id=%s status=%s scheduled_time=%s by user_id=%s",
            round_id,
            bidding_round.status,
            bidding_round.scheduled_time,
            request.user.id,
        )
        return CustomResponse(error="Cannot start bidding yet", status_code=status.HTTP_400_BAD_REQUEST)

    bidding_round.status = BiddingRoundStatusEnum.ACTIVE.value
    bidding_round.start_time = timezone.now()
    bidding_round.save()

    logger.info(
        "Bidding started: round_id=%s group_id=%s by user_id=%s", round_id, bidding_round.group_id, request.user.id,
    )
    return CustomResponse(
        data={
            "bidding_round": BiddingRoundSerializer(bidding_round).data,
        },
        message="Bidding Stated",
        status_code=status.HTTP_200_OK,
    )


# * not to be used in PRODUCTION
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_bidding(request, round_id):
    """End bidding and determine winner"""
    bidding_round: BiddingRound = get_object_or_404(
        BiddingRound.objects.select_related("group"),
        id=round_id,
    )

    permission = IsGroupAdmin()
    if not permission.has_object_permission(request, None, bidding_round.group):
        raise PermissionDenied(permission.message)

    if not bidding_round.is_active():
        logger.warning("Cannot end bidding: round_id=%s is not active (status=%s)", round_id, bidding_round.status)
        return CustomResponse(error="Bidding round is not active", status_code=status.HTTP_400_BAD_REQUEST)

    if not bidding_round.end_bidding():
        logger.warning("Cannot end bidding: no eligible winner for round_id=%s", round_id)
        return CustomResponse(error="No eligible members to select a winner", status_code=status.HTTP_400_BAD_REQUEST)

    bidding_round.refresh_from_db()
    logger.info(
        "Bidding ended: round_id=%s winner_id=%s winning_bid_id=%s by user_id=%s",
        round_id,
        bidding_round.winner_id,
        bidding_round.winning_bid_id,
        request.user.id,
    )
    return CustomResponse(
        data={"bidding_round": BiddingRoundSerializer(bidding_round).data},
        message="Bidding ended successfully",
        status_code=status.HTTP_200_OK,
    )


# * not to be used in PRODUCTION
@api_view(["POST"])
def make_bidding_active(request, round_id):
    bidding_round = get_object_or_404(BiddingRound, id=round_id)

    permission = IsGroupAdmin()
    if not permission.has_object_permission(request, None, bidding_round.group):
        raise PermissionDenied(permission.message)

    bidding_round.status = BiddingRoundStatusEnum.ACTIVE.value
    bidding_round.start_time = timezone.now()
    bidding_round.save()

    logger.info(
        "Bidding force-activated: round_id=%s group_id=%s by user_id=%s",
        round_id,
        bidding_round.group_id,
        request.user.id,
    )
    return CustomResponse(
        data={
            "bidding_round": BiddingRoundSerializer(bidding_round).data,
        },
        message="Bidding Stated",
        status_code=status.HTTP_200_OK,
    )

from Authentication.serializers import BaseUserSerializer
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def bidding_room(request, round_id):
    """Get bidding room details"""
    bidding_round: BiddingRound = get_object_or_404(BiddingRound, id=round_id)

    # Check if user is a member
    try:
        member: GroupMember = GroupMember.objects.get(group=bidding_round.group, user=request.user)
    except GroupMember.DoesNotExist:
        return CustomResponse(
            error="You are not a member of this group",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    # * maybe add list of bids? here

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

    # Validate bidding round is active
    if not bidding_round.is_active():
        return CustomResponse(is_success=False, error="Bidding is not active", status_code=status.HTTP_400_BAD_REQUEST)

    # Get member
    try:
        member = GroupMember.objects.get(group=bidding_round.group, user=request.user)
    except GroupMember.DoesNotExist:
        return CustomResponse(is_success=False, error="Not a member", status_code=status.HTTP_403_FORBIDDEN)

    # Check if already won
    if member.has_won:
        return CustomResponse(is_success=False, error="Already won a round", status_code=status.HTTP_403_FORBIDDEN)

    # Get bid amount
    try:
        bid_amount = int(request.data.get("amount", 0))
    except (ValueError, TypeError):
        return CustomResponse(is_success=False, error="Invalid amount", status_code=status.HTTP_400_BAD_REQUEST)

    if bidding_round.bids.filter(amount=bid_amount).exists():
        return CustomResponse(
            is_success=False,
            error="Bid amount already exists",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Validate bid amount (must be less than total amount)
    if bid_amount <= 0 or bid_amount > int(bidding_round.group.target_amount):
        return CustomResponse(
            is_success=False,
            error="Invalid bid amount. Must be between 0 and group target amount.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            bid = Bid.objects.create(bidding_round=bidding_round, member=member, amount=bid_amount)
    except IntegrityError:
        return CustomResponse(
            is_success=False,
            error="Bid amount already exists",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
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
        return CustomResponse(error="Cannot start bidding yet", status_code=status.HTTP_400_BAD_REQUEST)

    bidding_round.status = BiddingRoundStatusEnum.ACTIVE.value
    bidding_round.start_time = timezone.now()
    bidding_round.save()

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
        BiddingRound.objects.select_related("group"), id=round_id,
    )

    permission = IsGroupAdmin()
    if not permission.has_object_permission(request, None, bidding_round.group):
        raise PermissionDenied(permission.message)

    if not bidding_round.is_active():
        return CustomResponse(error="Bidding round is not active", status_code=status.HTTP_400_BAD_REQUEST)

    if not bidding_round.end_bidding():
        return CustomResponse(error="No eligible members to select a winner", status_code=status.HTTP_400_BAD_REQUEST)

    bidding_round.refresh_from_db()
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

    return CustomResponse(
        data={
            "bidding_round": BiddingRoundSerializer(bidding_round).data,
        },
        message="Bidding Stated",
        status_code=status.HTTP_200_OK,
    )

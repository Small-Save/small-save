from django.db.models import Min
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from Bidding.models import Bid
from Bidding.models import BiddingRound
from Bidding.models import BiddingRoundStatusEnum
from Bidding.serializers import BiddingRoundSerializer
from Bidding.serializers import BidSerializer
from Groups.models import GroupMember
from Groups.permissions import IsGroupAdmin
from utils.response import CustomResponse


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def bidding_room(request, round_id):
    """Get bidding room details"""
    bidding_round = get_object_or_404(BiddingRound, id=round_id)

    # Check if user is a member
    try:
        # TODO add a check to check if the bidding has started ??
        # This can be added if this is a joining request else if just view then no need to add is_acrive()

        member = GroupMember.objects.get(group=bidding_round.group, user=request.user)
    except GroupMember.DoesNotExist:
        return CustomResponse(
            error="You are not a member of this group",
            status=status.HTTP_403_FORBIDDEN,
        )

    current_lowest = bidding_round.bids.filter(is_valid=True).aggregate(Min("amount"))["amount__min"]
    # * maybe add list of bids? here

    return CustomResponse(
        data={
            "bidding_round": BiddingRoundSerializer(bidding_round).data,
            "current_lowest_bid": int(current_lowest) if current_lowest else None,
            "can_bid": not member.has_won and bidding_round.is_active(),
        },
        is_success=True,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_bid(request, round_id):
    """Handle bid placement"""
    bidding_round = get_object_or_404(BiddingRound, id=round_id)

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

    # Validate bid amount (must be less than total amount)
    if bid_amount <= 0 or bid_amount >= int(bidding_round.group.target_amount):
        return CustomResponse(
            is_success=False,
            error="Invalid bid amount. Must be between 0 and group target amount.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Create bid
    bid = Bid.objects.create(bidding_round=bidding_round, member=member, amount=bid_amount)

    # Get current lowest bid
    lowest_bid = bidding_round.bids.filter(is_valid=True).aggregate(Min("amount"))["amount__min"]

    return CustomResponse(
        data={
            "bid": BidSerializer(bid).data,
            "current_lowest": int(lowest_bid) if lowest_bid else None,
        },
        status_code=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_bidding_status(request, round_id):
    """Get current bidding status"""
    bidding_round = get_object_or_404(BiddingRound, id=round_id)

    # Check if user is a member
    try:
        GroupMember.objects.get(group=bidding_round.group, user=request.user)
    except GroupMember.DoesNotExist:
        return CustomResponse(error="Not a member", status=status.HTTP_403_FORBIDDEN)

    bids = bidding_round.bids.filter(is_valid=True).order_by("amount", "timestamp")[:10]

    return CustomResponse(
        data={
            "status": bidding_round.status,
            "bids": BidSerializer(bids, many=True).data,
            "time_remaining": None,  # TODO: Calculate based on your end time logic
        },
        status_code=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_bidding(request, round_id):
    """Start a bidding round (admin only)"""
    bidding_round = get_object_or_404(BiddingRound, id=round_id)

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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_bidding(request, round_id):
    """End bidding and determine winner"""
    bidding_round = get_object_or_404(BiddingRound, id=round_id)

    permission = IsGroupAdmin()
    if not permission.has_object_permission(request, None, bidding_round.group):
        raise PermissionDenied(permission.message)

    if bidding_round.status != BiddingRoundStatusEnum.ACTIVE.value:
        return CustomResponse(error="Bidding is not active", status_code=status.HTTP_400_BAD_REQUEST)

    # Get winning bid (lowest amount, earliest timestamp)
    winning_bid = bidding_round.bids.filter(is_valid=True).order_by("amount", "timestamp").first()

    if not winning_bid:
        return CustomResponse(error="No valid bids", status_code=status.HTTP_400_BAD_REQUEST)

    # Update round
    bidding_round.status = BiddingRoundStatusEnum.COMPLETED.value
    bidding_round.end_time = timezone.now()
    bidding_round.winner = winning_bid.member
    bidding_round.winning_bid = winning_bid.amount
    bidding_round.save()

    # Mark member as having won
    winning_bid.member.has_won = True
    winning_bid.member.save()

    return CustomResponse(
        data={
            "winner": winning_bid.member.user,
            "winning_amount": float(winning_bid.amount),
            "bidding_round": BiddingRoundSerializer(bidding_round).data,
        },
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


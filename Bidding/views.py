from django.db.models import Min
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from Bidding.models import BiddingRound
from Bidding.serializers import BiddingRoundSeriallizer
from Groups.models import GroupMember
from Groups.serializers import GroupMemberSerializer
from Groups.serializers import GroupReadSerializer
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
        {
            "bidding_round": BiddingRoundSeriallizer(bidding_round).data,
            "group": GroupReadSerializer(bidding_round.group).data,
            "member": GroupMemberSerializer(member).data,
            "current_lowest_bid": float(current_lowest) if current_lowest else None,
            "can_bid": not member.has_won and bidding_round.is_active(),
        },
    )

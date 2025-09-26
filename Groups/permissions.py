from rest_framework.permissions import BasePermission
from Groups.models import GroupMember

class IsGroupAdmin(BasePermission):
    """
    Allows access only to group admins (creator or role='admin').
    Expects view.get_object() to return a Group instance.
    """

    message = "You are not allowed to modify this group."

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated:
            return GroupMember.objects.filter(
                group=obj, user=request.user, role="admin"
            ).exists()
        return False
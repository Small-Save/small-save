# models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class Group(models.Model):
    WINNER_SELECTION_CHOICES = [
        ("random", "Random"),
        ("round_robin", "Round Robin"),
        ("bid", "Bid"),
    ]

    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(
        max_digits=12, decimal_places=2, help_text="Target amount for the group"
    )
    size = models.PositiveIntegerField(
        help_text="Number of members in the group", validators=[MinValueValidator(5)]
    )
    duration = models.PositiveIntegerField(
        help_text="Duration of the group in periods (e.g., months)"
    )
    winner_selection_method = models.CharField(
        max_length=50,
        choices=WINNER_SELECTION_CHOICES,
        default="random",
        help_text="Method for selecting the winner each period",
    )
    start_date = models.DateField(help_text="Start date of the group")

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, related_name="Admins", null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    members = models.ManyToManyField(User, through="GroupMember", related_name="custom_groups")

    class Meta:
        db_table = "groups"
        indexes = [
            models.Index(fields=["start_date"]),
        ]

    def __str__(self):
        return f"Group (Name: {self.name} Size: {self.size}, Start: {self.start_date})"


class GroupMember(models.Model):
    """
    Through model for Group <-> User relationship. Using this allows us to bulk_create
    membership rows and store membership metadata.
    """

    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=50, default="member")

    class Meta:
        db_table = "group_members"
        constraints = [
            models.UniqueConstraint(fields=["group", "user"], name="unique_group_user")
        ]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["group"]),
        ]

    def __str__(self):
        return f"{self.user_id} in Group {self.group_id}"

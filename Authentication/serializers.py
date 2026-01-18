from django.contrib.auth import get_user_model
from rest_framework import serializers
from Groups.services import normalize_phone_number

User = get_user_model()


class BaseUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
        )


class UserLiteSerializer(BaseUserSerializer):
    """Used for lightweight responses (like lists)."""

    class Meta(BaseUserSerializer.Meta):
        fields = ("id", "username")


class UserDetailSerializer(BaseUserSerializer):
    """Used when full details are needed (like profile or admin views)."""

    class Meta(BaseUserSerializer.Meta):
        fields = "__all__"


class RegisterUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["phone_number", "first_name", "last_name", "email", "gender"]
        extra_kwargs = {
            "phone_number": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
            "email": {"required": False, "allow_blank": True},
            "gender": {"required": True},
        }

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "User with this phone number already exists."
            )
        # TODO: Fix this later
        # normalized = normalize_phone_number(value)
        # if not normalized:
        #     raise serializers.ValidationError("Invalid phone number")
        # return normalized


class SendOtpSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Enter a valid phone number.")
        return value


class VerifyOtpSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    otp_code = serializers.CharField(max_length=6)

    def validate_otp(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Please enter valid OTP")
        return value

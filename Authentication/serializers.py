from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Register

User = get_user_model()


class BaseUserSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "profile_pic",
        )

    def get_profile_pic(self, obj):
        # Prefer absolute URL when request context is available
        url = obj.profile_pic_url
        if not url:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url


class UserLiteSerializer(BaseUserSerializer):
    """Used for lightweight responses (like lists)."""

    class Meta(BaseUserSerializer.Meta):
        fields = ("id", "username")


class UserDetailSerializer(BaseUserSerializer):
    """Used when full details are needed (like profile or admin views)."""

    class Meta(BaseUserSerializer.Meta):
        fields = "__all__"


class RegisterUserSerializer(serializers.ModelSerializer):
    """Validates registration input, OTP gate, and creates the `User` instance."""

    class Meta:
        model = User
        fields = [
            "phone_number",
            "first_name",
            "last_name",
            "email",
            "gender",
            "profile_pic",
        ]
        extra_kwargs = {
            "phone_number": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
            "email": {"required": False, "allow_blank": True},
            "gender": {"required": True},
        }

    @staticmethod
    def _username_from_names(first_name: str, last_name: str) -> str:
        return f"{first_name}{last_name}".replace(" ", "").lower()

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "User with this phone number already exists."
            )
        return value

    def validate(self, attrs):
        phone = attrs.get("phone_number")
        if not Register.objects.filter(phone_number=phone, is_verified=True).exists():
            raise serializers.ValidationError(
                {"phone_number": "Phone number not verified via OTP"}
            )
        return attrs

    def create(self, validated_data):
        first_name = validated_data["first_name"].strip()
        last_name = validated_data["last_name"].strip()
        phone_number = validated_data["phone_number"]
        username = self._username_from_names(first_name, last_name)
        user, created = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "gender": validated_data["gender"],
                "email": validated_data.get("email"),
                "profile_pic": validated_data.get("profile_pic"),
                "is_verified": True,
            },
        )
        if not created:
            raise serializers.ValidationError(
                {"phone_number": "User already exists."},
            )
        return user


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

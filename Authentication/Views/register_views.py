import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from Authentication.models import Register, User
from Authentication.serializers import RegisterUserSerializer
from utils.response import CustomResponse

logger = logging.getLogger(__name__)


class RegisterUser(APIView):
    def post(self, request):
        logger.info("Registration request received")
        serializer = RegisterUserSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("Registration failed: invalid data %s", serializer.errors)
            return CustomResponse(
                is_success=False,
                data={},
                message="Registration failed.",
                toast_message="Invalid Data",
                error=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        first_name = serializer.validated_data["first_name"].strip()
        last_name = serializer.validated_data["last_name"].strip()
        username = f"{first_name}{last_name}".replace(" ", "").lower()
        phone_number = serializer.validated_data["phone_number"]
        gender = serializer.validated_data["gender"]
        logger.debug("Validated registration data: phone=%s", phone_number)

        otp_verified = Register.objects.filter(phone_number=phone_number, is_verified=True).exists()

        if not otp_verified:
            logger.warning("Registration blocked: phone=%s not verified via OTP", phone_number)
            return CustomResponse(
                is_success=False,
                data={},
                message="Unauthorized User.",
                toast_message="Not Verified User",
                error="Phone number not verified via OTP",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        logger.debug("Generated username=%s for phone=%s", username, phone_number)

        try:
            user, created = User.objects.get_or_create(
                phone_number=phone_number,
                defaults={
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "gender": gender,
                    "email": serializer.validated_data.get("email", None),
                    "is_verified": True,
                },
            )
        except Exception:
            logger.exception("Database error during user creation for phone=%s", phone_number)
            return CustomResponse(
                is_success=False,
                data={},
                message="Registration failed due to server error.",
                toast_message="Server Error",
                error="Internal server error",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not created:
            logger.info("Registration skipped: user already exists phone=%s user_id=%s", phone_number, user.id)
            return CustomResponse(message="User already exists", data={}, status_code=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        logger.info("Registration successful: user_id=%s phone=%s", user.id, phone_number)

        return CustomResponse(
            is_success=True,
            message="Registration successful, user logged in",
            data={
                "user": {
                    "id": user.id,
                    "phone_number": user.phone_number,
                    "email": user.email,
                    "userName": user.username,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status_code=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                logger.warning("Logout failed: missing refresh token for user_id=%s", request.user.id)
                return CustomResponse(
                    is_success=False,
                    message="Refresh token is required.",
                    toast_message="Logout failed.",
                    error="MissingRefreshToken",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            logger.info("Logout successful: user_id=%s", request.user.id)
            return CustomResponse(
                is_success=True,
                message="Logout successful.",
                toast_message="You have been logged out.",
                status_code=status.HTTP_200_OK,
            )

        except Exception:
            logger.exception("Logout failed for user_id=%s", request.user.id)
            return CustomResponse(
                is_success=False,
                data={},
                message="Logout failed.",
                toast_message="Something went wrong.",
                error="Logout failed",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class TokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            logger.warning("Token refresh failed: missing refresh token")
            return Response(is_success=False, message="Refresh token required", data={}, status=400)

        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            logger.debug("Token refreshed successfully")
            return Response(
                {"access": new_access_token, "refresh": str(token)},
                status=status.HTTP_200_OK,
            )
        except Exception:
            logger.warning("Token refresh failed: invalid or expired refresh token")
            return Response(
                {"detail": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

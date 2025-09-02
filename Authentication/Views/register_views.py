from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from utils.response import CustomResponse

from ..models import Register, User
from ..serializers import register_user_serializer


class RegisterUser(APIView):
    def post(self, request):
        username = request.data.get("username")
        phone_number = request.data.get("phone_number")
        serializer = register_user_serializer.RegisterUserSerializer(data=request.data)

        if not serializer.is_valid():
            return CustomResponse(
                is_success=False,
                data={},
                message="Registration failed.",
                toast_message="Invalid Data",
                error=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        phone_number = serializer.validated_data["phone_number"]

        otp_verified = Register.objects.filter(
            phone_number=phone_number, is_verified=True
        ).exists()

        if not otp_verified:
            return CustomResponse(
                is_success=False,
                data={},
                message="Unauthorized User.",
                toast_message="Not Verified User",
                error="Phone number not verified via OTP",
                status=status.HTTP_400_BAD_REQUEST,
            )

        first_name = serializer.validated_data["first_name"].strip()
        last_name = serializer.validated_data["last_name"].strip()
        username = f"{first_name}{last_name}".replace(" ", "").lower()
        user, created = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "email": serializer.validated_data.get("email", None),
                "is_verified": True,
            },
        )

        if not created:
            return CustomResponse(message="User already exists", data={}, status=400)

        refresh = RefreshToken.for_user(user)
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
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=201,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return CustomResponse(
                    is_success=False,
                    message="Refresh token is required.",
                    toast_message="Logout failed.",
                    error="MissingRefreshToken",
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return CustomResponse(
                is_success=True,
                message="Logout successful.",
                toast_message="You have been logged out.",
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return CustomResponse(
                is_success=False,
                data={},
                message="Logout failed.",
                toast_message="Something went wrong.",
                error=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )


class TokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                is_success=False, message="Refresh token required", data={}, status=400
            )

        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            return Response(
                {"access": new_access_token, "refresh": str(token)},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

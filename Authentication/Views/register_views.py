"""Registration, JWT session management, and current-user profile for auth."""

from __future__ import annotations

import logging

from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from Authentication.serializers import (
    BaseUserSerializer,
    RegisterUserSerializer,
)
from utils.response import CustomResponse

logger = logging.getLogger(__name__)


def _otp_not_verified_response(
    serializer: RegisterUserSerializer,
) -> CustomResponse | None:
    """Match legacy client expectations when OTP gate fails in the serializer."""
    raw = serializer.errors.get("phone_number")
    if raw is None:
        return None
    messages = raw if isinstance(raw, (list, tuple)) else [raw]
    if not any("not verified via OTP" in str(m) for m in messages):
        return None
    return CustomResponse(
        is_success=False,
        data={},
        message="Unauthorized User.",
        toast_message="Not Verified User",
        error="Phone number not verified via OTP",
        status_code=status.HTTP_400_BAD_REQUEST,
    )


def _refresh_token_from_body(request: Request) -> str | None:
    raw = request.data.get("refresh")
    return raw if raw else None


class RegisterUser(APIView):
    """Create a user after OTP verification; returns JWT pair and user summary."""

    def post(self, request: Request):
        logger.info("Registration request received")
        serializer = RegisterUserSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("Registration failed: invalid data %s", serializer.errors)
            otp_resp = _otp_not_verified_response(serializer)
            if otp_resp is not None:
                return otp_resp
            return CustomResponse(
                is_success=False,
                data={},
                message="Registration failed.",
                toast_message="Invalid Data",
                error=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        phone_number = serializer.validated_data["phone_number"]
        logger.debug("Validated registration data: phone=%s", phone_number)

        try:
            user = serializer.save()
        except serializers.ValidationError as exc:
            logger.info(
                "Registration skipped: duplicate phone after race phone=%s",
                phone_number,
            )
            return CustomResponse(
                is_success=False,
                message="User already exists",
                data={},
                error=exc.detail,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception(
                "Database error during user creation for phone=%s",
                phone_number,
            )
            return CustomResponse(
                is_success=False,
                data={},
                message="Registration failed due to server error.",
                toast_message="Server Error",
                error="Internal server error",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        refresh = RefreshToken.for_user(user)
        logger.info(
            "Registration successful: user_id=%s phone=%s",
            user.id,
            phone_number,
        )

        return CustomResponse(
            is_success=True,
            message="Registration successful, user logged in",
            data={
                "user": BaseUserSerializer(user, context={"request": request}).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status_code=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """Blacklist the provided refresh token; must match the authenticated user."""

    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        refresh_raw = _refresh_token_from_body(request)
        if not refresh_raw:
            logger.warning(
                "Logout failed: missing refresh token for user_id=%s",
                request.user.id,
            )
            return CustomResponse(
                is_success=False,
                data={},
                message="Refresh token is required.",
                toast_message="Logout failed.",
                error="MissingRefreshToken",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_raw)
        except TokenError as exc:
            logger.warning(
                "Logout failed: invalid refresh token for user_id=%s: %s",
                request.user.id,
                exc,
            )
            return CustomResponse(
                is_success=False,
                data={},
                message="Invalid or expired refresh token.",
                toast_message="Logout failed.",
                error="InvalidRefreshToken",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        if str(token["user_id"]) != str(request.user.id):
            logger.warning(
                "Logout rejected: refresh token user mismatch session_user=%s token_user=%s",
                request.user.id,
                token["user_id"],
            )
            return CustomResponse(
                is_success=False,
                data={},
                message="Refresh token does not belong to the current session.",
                toast_message="Logout failed.",
                error="RefreshTokenUserMismatch",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        try:
            token.blacklist()
        except TokenError as exc:
            logger.warning(
                "Logout failed while blacklisting for user_id=%s: %s",
                request.user.id,
                exc,
            )
            return CustomResponse(
                is_success=False,
                data={},
                message="Could not complete logout.",
                toast_message="Logout failed.",
                error="BlacklistFailed",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        logger.info("Logout successful: user_id=%s", request.user.id)
        return CustomResponse(
            is_success=True,
            message="Logout successful.",
            toast_message="You have been logged out.",
            status_code=status.HTTP_200_OK,
        )


class TokenRefreshView(APIView):
    """Exchange a valid refresh token for a new access (and rotated refresh) token."""

    def post(self, request: Request):
        refresh_raw = _refresh_token_from_body(request)
        if not refresh_raw:
            logger.warning("Token refresh failed: missing refresh token")
            return CustomResponse(
                is_success=False,
                data={},
                message="Refresh token is required.",
                toast_message="Session refresh failed.",
                error="MissingRefreshToken",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_raw)
        except TokenError:
            logger.warning("Token refresh failed: invalid or expired refresh token")
            return CustomResponse(
                is_success=False,
                data={},
                message="Invalid or expired refresh token.",
                toast_message="Session refresh failed.",
                error="InvalidRefreshToken",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        logger.debug("Token refreshed successfully")
        return CustomResponse(
            is_success=True,
            message="Token refreshed",
            data={
                "access": str(token.access_token),
                "refresh": str(token),
            },
            status_code=status.HTTP_200_OK,
        )


class GetUserInfo(generics.RetrieveAPIView):
    """Return the authenticated user serialized with `BaseUserSerializer`."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = BaseUserSerializer

    def get(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(request.user, context={"request": request})
        return CustomResponse(
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            is_success=True,
        )

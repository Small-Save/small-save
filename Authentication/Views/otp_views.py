from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from utils.response import CustomResponse

from Authentication.models import Register, User
from Authentication.serializers import otp_serializers
from Authentication.services.twilio_service import send_otp
import logging
import random

logger = logging.getLogger("api")


class SendOtp(APIView):
    def post(self, request):
        serializers = otp_serializers.SendOtpSerializer(data=request.data)

        if serializers.is_valid():
            phone = serializers.validated_data["phone_number"]
            Register.objects.filter(phone_number=phone).delete()
            otp = str(random.randint(100000, 999999))
            # otp = send_otp(phone)
            Register.objects.create(phone_number=phone, otp_code=otp)
            logger.info(f"OTP request received for phone={phone}")
            return CustomResponse(
                True,
                message="OTP sent successfully",
                toast_message="OTP sent successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        logger.error("OTP request failed: phone number missing")
        return CustomResponse(
            False,
            error=serializers.errors,
            message="Phone Number required",
            toast_message="Invalid Data",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class VerifyOtp(APIView):
    def post(self, request):
        serializer = otp_serializers.VerifyOtpSerializer(data=request.data)

        if not serializer.is_valid():
            logger.error("Invalid input")
            return CustomResponse(
                is_success=False,
                data={},
                message="Invalid input",
                toast_message="",
                error=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        phone_number = serializer.validated_data["phone_number"]
        otp_code = serializer.validated_data["otp_code"]

        try:
            register_obj = Register.objects.filter(
                phone_number=phone_number, otp_code=otp_code, is_verified=False
            ).latest("created_at")
        except Register.DoesNotExist:
            logger.error("No data exists with the otp and phone number")
            return CustomResponse(
                is_success=False,
                data={},
                message="OTP expired",
                toast_message="",
                error="Invalid or expired OTP",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if register_obj.is_expired():
            logger.error("otp is expired")
            return CustomResponse(
                is_success=False,
                data={},
                message="OTP expired",
                toast_message="",
                error="Invalid or expired OTP",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        register_obj.is_verified = True
        register_obj.save()

        user_obj = User.objects.filter(
            phone_number=phone_number, is_verified=True
        ).first()

        if not user_obj:
            logger.info("user does not exist proceed with registration process")
            return CustomResponse(
                is_success=True,
                data={
                    "user": {
                        "id": "",
                        "phone_number": phone_number,
                        "is_registered": False,
                        "userName": "",
                    },
                    "access": "",
                    "refresh": "",
                },
                message="OTP Verified successfully.",
                toast_message="",
                status_code=status.HTTP_200_OK,
            )

        # Generate JWT tokens for existing user
        refresh = RefreshToken.for_user(user_obj)
        logger.info("User already exists proceed with login")
        return CustomResponse(
            is_success=True,
            data={
                "user": {
                    "id": user_obj.id,
                    "phone_number": user_obj.phone_number,
                    "user_name": user_obj.username,
                    "is_registered": True,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            message="Login successful.",
            toast_message="",
            status_code=status.HTTP_200_OK,
        )

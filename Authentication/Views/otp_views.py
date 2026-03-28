import logging
import random

from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from Authentication.models import Register, User
from Authentication.serializers import SendOtpSerializer, VerifyOtpSerializer
from Authentication.services.twilio_service import send_otp  # noqa: F401
from utils.response import CustomResponse

logger = logging.getLogger(__name__)


class SendOtp(APIView):
    def post(self, request):
        serializers = SendOtpSerializer(data=request.data)

        if serializers.is_valid():
            phone = serializers.validated_data["phone_number"]
            Register.objects.filter(phone_number=phone).delete()
            otp = str(random.randint(100000, 999999))
            # otp = send_otp(phone)
            print(otp)
            Register.objects.create(phone_number=phone, otp_code=otp)
            logger.info("OTP sent for phone=%s", phone)
            return CustomResponse(
                True,
                message="OTP sent successfully",
                toast_message="OTP sent successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        logger.warning("OTP request failed: invalid data %s", serializers.errors)
        return CustomResponse(
            is_success=False,
            error=serializers.errors,
            message="Phone Number required",
            toast_message="Invalid Data",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class VerifyOtp(APIView):
    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)

        if not serializer.is_valid():
            logger.warning("OTP verification failed: invalid input %s", serializer.errors)
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
                phone_number=phone_number, otp_code=otp_code, is_verified=False,
            ).latest("created_at")
        except Register.DoesNotExist:
            logger.warning("OTP verification failed: no matching record for phone=%s", phone_number)
            return CustomResponse(
                is_success=False,
                data={},
                message="OTP expired",
                toast_message="",
                error="Invalid or expired OTP",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if register_obj.is_expired():
            logger.warning("OTP expired for phone=%s", phone_number)
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

        user_obj = User.objects.filter(phone_number=phone_number, is_verified=True).first()

        if not user_obj:
            logger.info("OTP verified for phone=%s, new user — proceeding to registration", phone_number)
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

        refresh = RefreshToken.for_user(user_obj)
        logger.info("OTP verified for phone=%s, existing user_id=%s — logged in", phone_number, user_obj.id)
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

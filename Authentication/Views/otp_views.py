import random
from django.shortcuts import render
from ..models import User, Register
from ..services.twilio_service import send_otp
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from utils.response import CustomResponse
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from ..serializers import otp_serializers



class SendOtp(APIView):
    def post(self, request):
        print("data", request.data)
        serializers = otp_serializers.SendOtpSerializer(data = request.data)

        if serializers.is_valid():
            phone = serializers.validated_data["phone_number"]
            Register.objects.filter(phone_number=phone, is_verified=False).delete()
            otp = send_otp(phone) 
            # otp = str(random.randint(100000,999999))
            Register.objects.create(phone_number=phone, otp_code=otp)
            return CustomResponse(True, message="OTP sent successfully", toast_message="OTP sent successfully.",
                                    status=status.HTTP_201_CREATED)
        return CustomResponse(False, error= serializers.errors ,message="Phone Number required", toast_message="Invalid Data",
                                  status=status.HTTP_400_BAD_REQUEST)



class VerifyOtp(APIView):
    def post(self, request):
        serializer = otp_serializers.VerifyOtpSerializer(data=request.data)

        if not serializer.is_valid():
            return CustomResponse(
                is_success=False,
                data={},
                message="Invalid input",
                toast_message="",
                error=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )
        phone_number = serializer.validated_data["phone_number"]
        otp_code = serializer.validated_data["otp_code"]

        try:
            register_obj = Register.objects.filter(
                phone_number=phone_number,
                otp_code=otp_code,
                is_verified=False
            ).latest("created_at")
        except Register.DoesNotExist:
            return CustomResponse(
                is_success=False,
                data={},
                message="OTP expired",
                toast_message="",
                error="Invalid or expired OTP",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if register_obj.is_expired():
            return CustomResponse(
                is_success=False,
                data={},
                message="OTP expired",
                toast_message="",
                error="Invalid or expired OTP",
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        register_obj.is_verified = True
        register_obj.save()

        # Check if user exists
        user_obj = User.objects.filter(phone_number=phone_number, is_verified=True).first()

        if not user_obj:
            return CustomResponse(
                is_success=True,
                data={"phone_number": phone_number},
                message="OTP Verified successfully.",
                toast_message="",
                status=status.HTTP_200_OK,
            )

        # Generate JWT tokens for existing user
        refresh = RefreshToken.for_user(user_obj)
        return CustomResponse(
            is_success=True,
            data={
                "user": {
                    "id": user_obj.id,
                    "phone_number": user_obj.phone_number,
                    "userName": user_obj.username
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            message="Login successful.",
            toast_message="",
            status=status.HTTP_200_OK,
        )

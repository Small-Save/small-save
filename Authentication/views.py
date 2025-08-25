import random
from django.shortcuts import render
from .models import User, Register
from .services.twilio_service import send_otp
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class SendOtp(APIView):
    def post(self, request):
        phone = request.data.get("phone_number")

        if not phone:
            return Response({"error": "Phone number required"}, status=status.HTTP_400_BAD_REQUEST)

        # Clean old unverified OTPs
        Register.objects.filter(phone_number=phone, is_verified=False).delete()

        otp = send_otp(phone)
        Register.objects.create(phone_number=phone, otp_code=otp)
        return Response({"message": "OTP sent successfully"}, status=status.HTTP_201_CREATED)


class VerifyOtp(APIView):
    def post(self, request):
        phone_number = request.data.get("phone_number")
        otp_code = request.data.get("otp_code")

        if not phone_number or not otp_code:
            return Response({"message": "Phone number and OTP required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            register_obj = Register.objects.filter(
                phone_number=phone_number,
                otp_code=otp_code,
                is_verified=False
            ).latest("created_at")
        except Register.DoesNotExist:
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # Expiry check
        if register_obj.is_expired():
            return Response({"error": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)

        register_obj.is_verified = True
        register_obj.save()

        return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)


class RegisterUser(APIView):
    def post(self, request):
        username = request.data.get("username")
        phone_number = request.data.get("phone_number")

        if not username or not phone_number:
            return Response({"error": "Username and phone number are required"}, status=status.HTTP_400_BAD_REQUEST)

        otp_verified = Register.objects.filter(phone_number=phone_number, is_verified=True).exists()

        if not otp_verified:
            return Response({"error": "Phone number not verified via OTP"}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={"username": username, "email": "", "is_verified": True}
        )

        if not created:
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
import random
from django.shortcuts import render
from .models import User, Register
from .services.twilio_service import send_otp
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from utils.response import CustomResponse
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated


class SendOtp(APIView):
    def post(self, request):
        phone = request.data.get("phone_number")

        if not phone:
            return CustomResponse(False, error= "Phone number required" ,message="Phone Number required", toast_message="Invalid Data",
                                  status=status.HTTP_400_BAD_REQUEST)

        # Clean old unverified OTPs
        Register.objects.filter(phone_number=phone, is_verified=False).delete()

        # otp = send_otp(phone)
        otp = str(random.randint(100000,999999))
        Register.objects.create(phone_number=phone, otp_code=otp)
        return CustomResponse(False, message="OTP sent successfully", toast_message="OTP sent successfully.",
                                  status=status.HTTP_201_CREATED)


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

        if register_obj.is_expired():
            return Response({"error": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)
        
        register_obj.is_verified = True
        register_obj.save()

        # Get user if exists
        user_obj = User.objects.filter(phone_number=phone_number, is_verified=True).first()

        if not user_obj:
            # User doesn't exist yet
            return Response({
                "is_success": True,
                "message": "Otp Verified",
                "data": {"phone_number": phone_number}
            }, status=200)

        # Generate JWT tokens for existing user
        refresh = RefreshToken.for_user(user_obj)
        return Response({
            "is_success": True,
            "message": "Login successful",
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        }, status=200)
        
        


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
            defaults={"username": username, "email": "abc@gmail.com", "is_verified": True}
        )

        if not created:
            return CustomResponse(
            message="User already exists",
            data={},
            status=400
        )

        refresh = RefreshToken.for_user(user)
        return CustomResponse(
            message="Registration successful, user logged in",
            data={
                "user": {
                    "id": user.id,
                    "phone_number": user.phone_number,
                    "email": user.email,
                },
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            },
            status=201
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(message="Logout successful")
        except Exception as e:
            return Response(is_success=False, error=str(e), status=400)
        
class TokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
             return Response(
            is_success= False,
            message="Refresh token required",
            data={},
            status=400)
        
        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            
            return Response({
                "access": new_access_token,
                "refresh": str(token)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
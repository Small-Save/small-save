from django.urls import path
from .views import SendOtp, RegisterUser, VerifyOtp

urlpatterns = [
    path("send-otp/", SendOtp.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOtp.as_view(), name="verify-otp"),
    path("register/", RegisterUser.as_view(), name="register-user"),
]
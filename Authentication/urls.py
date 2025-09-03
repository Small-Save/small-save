from django.urls import path

from .Views.otp_views import SendOtp, VerifyOtp
from .Views.register_views import LogoutView, RegisterUser, TokenRefreshView

urlpatterns = [
    path("send_otp/", SendOtp.as_view(), name="send_otp"),
    path("verify_otp/", VerifyOtp.as_view(), name="verify_otp"),
    path("register/", RegisterUser.as_view(), name="register_user"),
    path("token_refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]

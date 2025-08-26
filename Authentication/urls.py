from django.urls import path
from .views import LogoutView,RegisterUser, TokenRefreshView
from .Views.otp_views import SendOtp , VerifyOtp

urlpatterns = [
    path("send-otp/", SendOtp.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOtp.as_view(), name="verify-otp"),
    path("register/", RegisterUser.as_view(), name="register-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
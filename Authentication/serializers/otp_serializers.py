from rest_framework import serializers

class SendOtpSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

class VerifyOtpSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    otp_code = serializers.CharField(max_length=6)

    def validate_otp(self, value):
        if not value.isdigit() or len(value) != 6 :
            raise serializers.ValidationError("Please enter valid OTP")
        return value
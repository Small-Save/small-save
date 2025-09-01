from rest_framework import serializers
from  ..models import User

class RegisterUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["phone_number", "first_name", "last_name", "email"]
        extra_kwargs = {
            "phone_number": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
            "email": {"required": False, "allow_blank": True},
        }

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("User with this phone number already exists.")
        return value
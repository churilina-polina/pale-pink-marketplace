from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role", "shop_name")

    def validate(self, attrs):
        if attrs.get("role") == User.Role.SELLER and not attrs.get("shop_name"):
            raise serializers.ValidationError(
                {"shop_name": "Укажите название магазина для аккаунта продавца"}
            )
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "shop_name")

import secrets

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField(source="full_name", read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "name", "full_name", "email", "roll_number", "is_admin", "date_joined")
        read_only_fields = fields

    def get_id(self, obj):
        return str(obj.pk)


class SignupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="full_name")
    confirm_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("name", "email", "roll_number", "password", "confirm_password")

    def validate_email(self, value):
        return value.strip().lower()

    def validate_roll_number(self, value):
        return value.strip().upper()

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.pop("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        user = User(
            email=attrs["email"],
            full_name=attrs["full_name"],
            roll_number=attrs["roll_number"],
        )
        validate_password(password, user=user)
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            roll_number=validated_data["roll_number"],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )
        if not user:
            raise serializers.ValidationError({"detail": "Invalid email or password."})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is inactive."})

        attrs["user"] = user
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField(source="full_name", read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "full_name",
            "email",
            "roll_number",
            "is_active",
            "is_admin",
            "date_joined",
            "last_login",
        )
        read_only_fields = fields

    def get_id(self, obj):
        return str(obj.pk)


class AdminUserDetailSerializer(AdminUserSerializer):
    class Meta(AdminUserSerializer.Meta):
        fields = AdminUserSerializer.Meta.fields + (
            "is_staff",
            "is_superuser",
        )
        read_only_fields = fields


class AdminPasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        required=False,
        allow_blank=True,
        trim_whitespace=False,
        write_only=True,
    )
    temporary_password = serializers.CharField(read_only=True)
    detail = serializers.CharField(read_only=True)

    def validate(self, attrs):
        password = attrs.get("new_password", "").strip()
        user = self.context["target_user"]

        if not password:
            password = secrets.token_urlsafe(9)

        validate_password(password, user=user)
        attrs["resolved_password"] = password
        return attrs

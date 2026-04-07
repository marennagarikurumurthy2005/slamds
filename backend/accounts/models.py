from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from accounts.managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    roll_number = models.CharField(max_length=30, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "roll_number"]

    class Meta:
        ordering = ["full_name", "email"]

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        self.roll_number = self.roll_number.strip().upper()
        self.full_name = self.full_name.strip()
        super().save(*args, **kwargs)

    @property
    def is_admin(self) -> bool:
        return bool(self.is_staff and self.is_superuser)

    def __str__(self):
        return f"{self.full_name} ({self.roll_number})"

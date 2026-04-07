from django.conf import settings
from django.db import models
from django.utils import timezone


class SlamQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)


class Slam(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="slams",
    )
    author_name_snapshot = models.CharField(max_length=120)
    author_email_snapshot = models.EmailField()
    author_roll_number_snapshot = models.CharField(max_length=30)
    what_do_you_think = models.TextField(blank=True)
    how_would_you_describe = models.TextField(blank=True)
    best_memory = models.TextField(blank=True)
    suggestions_or_message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SlamQuerySet.as_manager()

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["author", "is_deleted"]),
            models.Index(fields=["status", "is_deleted"]),
            models.Index(fields=["submitted_at"]),
        ]

    def __str__(self):
        return f"{self.author_name_snapshot} - {self.status}"

    def refresh_author_snapshot(self):
        self.author_name_snapshot = self.author.full_name
        self.author_email_snapshot = self.author.email
        self.author_roll_number_snapshot = self.author.roll_number

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at", "updated_at"])

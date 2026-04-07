# Generated manually for MK Slam Collector.

import django.db.models.deletion
import django_mongodb_backend.fields.auto
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Slam",
            fields=[
                (
                    "id",
                    django_mongodb_backend.fields.ObjectIdAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("author_name_snapshot", models.CharField(max_length=120)),
                ("author_email_snapshot", models.EmailField(max_length=254)),
                ("author_roll_number_snapshot", models.CharField(max_length=30)),
                ("what_do_you_think", models.TextField(blank=True)),
                ("how_would_you_describe", models.TextField(blank=True)),
                ("best_memory", models.TextField(blank=True)),
                ("suggestions_or_message", models.TextField(blank=True)),
                (
                    "status",
                    models.CharField(
                        choices=[("draft", "Draft"), ("submitted", "Submitted")],
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("is_deleted", models.BooleanField(default=False)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "author",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="slams",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-updated_at"],
                "indexes": [
                    models.Index(fields=["author", "is_deleted"], name="slams_slam_author__8e29b5_idx"),
                    models.Index(fields=["status", "is_deleted"], name="slams_slam_status__7e6c2c_idx"),
                    models.Index(fields=["submitted_at"], name="slams_slam_submitt_eb6775_idx"),
                ],
            },
        ),
    ]

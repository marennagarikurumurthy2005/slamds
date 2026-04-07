from django.contrib import admin

from slams.models import Slam


@admin.register(Slam)
class SlamAdmin(admin.ModelAdmin):
    list_display = (
        "author_name_snapshot",
        "author_roll_number_snapshot",
        "status",
        "is_deleted",
        "submitted_at",
        "updated_at",
    )
    list_filter = ("status", "is_deleted", "submitted_at")
    search_fields = (
        "author_name_snapshot",
        "author_email_snapshot",
        "author_roll_number_snapshot",
        "what_do_you_think",
        "how_would_you_describe",
        "best_memory",
        "suggestions_or_message",
    )
    readonly_fields = (
        "author_name_snapshot",
        "author_email_snapshot",
        "author_roll_number_snapshot",
        "created_at",
        "updated_at",
        "submitted_at",
        "deleted_at",
    )

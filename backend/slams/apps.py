from django.apps import AppConfig


class SlamsConfig(AppConfig):
    default_auto_field = "django_mongodb_backend.fields.ObjectIdAutoField"
    name = "slams"
    verbose_name = "Slams"

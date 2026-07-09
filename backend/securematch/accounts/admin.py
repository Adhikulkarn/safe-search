from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from accounts.utils import get_primary_role


class CustomUserAdmin(UserAdmin):
    model = User

    # Fields to display in list view
    list_display = (
        "username",
        "primary_role",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )

    # Filters on the right sidebar
    list_filter = (
        "groups",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )

    # Search fields
    search_fields = (
        "username",
        "email",
    )

    # Readonly fields
    readonly_fields = (
        "created_at",
        "updated_at",
        "last_login",
        "date_joined",
    )

    # Easily assign groups with filter_horizontal
    filter_horizontal = ("groups",)

    # Fieldsets for detail view editing (excluding user_permissions as requested)
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                ),
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    def primary_role(self, obj):
        return get_primary_role(obj)
    primary_role.short_description = "Primary Role"


admin.site.register(User, CustomUserAdmin)

from django.db.models.signals import post_migrate
from django.contrib.auth.models import Group
from accounts.constants import (
    SUPER_ADMIN,
    INTERNAL_ANALYST,
    COMPLIANCE_OFFICER,
    EXTERNAL_AUDITOR,
    READ_ONLY_ANALYST,
)


def create_default_groups(sender, **kwargs):
    group_names = [
        SUPER_ADMIN,
        INTERNAL_ANALYST,
        COMPLIANCE_OFFICER,
        EXTERNAL_AUDITOR,
        READ_ONLY_ANALYST,
    ]
    for name in group_names:
        Group.objects.get_or_create(name=name)

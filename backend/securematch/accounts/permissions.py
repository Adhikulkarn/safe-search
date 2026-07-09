from rest_framework.permissions import BasePermission
from accounts.constants import (
    SUPER_ADMIN,
    INTERNAL_ANALYST,
    COMPLIANCE_OFFICER,
    EXTERNAL_AUDITOR,
    READ_ONLY_ANALYST,
)
from accounts.utils import has_any_role


class BaseRolePermission(BasePermission):
    """
    Base class for role-based authorization to avoid duplicated role-checking logic.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return has_any_role(request.user, self.allowed_roles)


class IsSuperAdministrator(BaseRolePermission):
    allowed_roles = [SUPER_ADMIN]


class IsInternalAnalyst(BaseRolePermission):
    allowed_roles = [INTERNAL_ANALYST]


class IsComplianceOfficer(BaseRolePermission):
    allowed_roles = [COMPLIANCE_OFFICER]


class IsExternalAuditor(BaseRolePermission):
    allowed_roles = [EXTERNAL_AUDITOR]


class IsReadOnlyAnalyst(BaseRolePermission):
    allowed_roles = [READ_ONLY_ANALYST]


# Reusable helper permissions
class IsInternalUser(BaseRolePermission):
    """
    Allows Internal Analyst, Compliance Officer, and Super Administrator.
    """
    allowed_roles = [INTERNAL_ANALYST, COMPLIANCE_OFFICER, SUPER_ADMIN]


class IsAdministrator(BaseRolePermission):
    """
    Allows Super Administrator only.
    """
    allowed_roles = [SUPER_ADMIN]

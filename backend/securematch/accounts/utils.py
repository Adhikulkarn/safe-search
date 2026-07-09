from accounts.constants import NO_ROLE

def get_primary_role(user):
    """
    Retrieves the primary group name for the user to be used as 'role'.
    If the user has multiple groups, returns the alphabetically first group name.
    If no group exists or the user is not authenticated, returns "No Role Assigned".
    Caches the result on the user instance to optimize repeated lookups during the request lifecycle.
    """
    if not user or not user.is_authenticated:
        return NO_ROLE

    if not hasattr(user, "_cached_primary_role"):
        group = user.groups.all().order_by("name").first()
        user._cached_primary_role = group.name if group else NO_ROLE

    return user._cached_primary_role


def has_role(user, role):
    """
    Checks if the user has the specified primary role.
    """
    if not user or not user.is_authenticated:
        return False
    return get_primary_role(user) == role


def has_any_role(user, roles):
    """
    Checks if the user's primary role matches any of the specified roles.
    """
    if not user or not user.is_authenticated:
        return False
    return get_primary_role(user) in roles

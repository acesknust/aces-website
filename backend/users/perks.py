"""
Perks that a super admin (project manager) can bundle into roles.

To add a new perk, add an entry here and guard the relevant view with
`HasPerk('<code>')`. Super admins (is_superuser) always hold every perk.
"""
from rest_framework import permissions

PERKS = {
    'take_attendance': 'Take attendance',
    'export_attendance': 'Export attendance to Excel',
    'manage_events': 'Create and edit events',
    'manage_scholarships': 'Create and edit scholarships',
}


def user_perks(user):
    """Return the set of perk codes the user holds."""
    if not user or not user.is_authenticated or not user.is_active:
        return set()
    if user.is_superuser:
        return set(PERKS)
    perks = set()
    for role in user.roles.all():
        perks.update(code for code in role.perks if code in PERKS)
    return perks


class IsSuperAdmin(permissions.BasePermission):
    """Only super admins (project managers) may manage roles."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


def HasPerk(*codes, staff_allowed=False):
    """
    Build a permission class that passes when the user holds any of `codes`.
    With staff_allowed=True, existing staff admins keep their current access.
    """

    class _HasPerk(permissions.BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if staff_allowed and user and user.is_authenticated and user.is_staff:
                return True
            return bool(user_perks(user) & set(codes))

    _HasPerk.__name__ = f"HasPerk({', '.join(codes)})"
    return _HasPerk


def HasPerkOrReadOnly(*codes, staff_allowed=False):
    """Anyone may read; writes need one of `codes`."""
    base = HasPerk(*codes, staff_allowed=staff_allowed)

    class _HasPerkOrReadOnly(base):
        def has_permission(self, request, view):
            if request.method in permissions.SAFE_METHODS:
                return True
            return super().has_permission(request, view)

    _HasPerkOrReadOnly.__name__ = f"HasPerkOrReadOnly({', '.join(codes)})"
    return _HasPerkOrReadOnly

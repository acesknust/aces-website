"""
File validators for course resource uploads.
Enforces allowed file types and maximum file size.
"""

import os
from django.core.exceptions import ValidationError


ALLOWED_EXTENSIONS = {
    'pdf', 'pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls',
    'zip', 'rar', '7z',
    'txt', 'csv',
    'png', 'jpg', 'jpeg',
}

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB


def validate_resource_file(file):
    """
    Validate uploaded course resource files.
    - Only allows known safe file extensions (no executables, scripts, etc.)
    - Enforces a 100MB max file size.
    """
    ext = os.path.splitext(file.name)[1].lower().lstrip('.')

    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"Unsupported file type: .{ext}. "
            f"Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    if file.size > MAX_FILE_SIZE:
        size_mb = file.size / (1024 * 1024)
        raise ValidationError(
            f"File too large: {size_mb:.1f}MB. Maximum allowed is 100MB."
        )

"""
Local-disk file storage for uploaded documents. Enforces the Section 7
upload rules: file-type allow-list, MIME-type verification independent
of extension, and a size cap. Swap this module out for S3/GCS in
production — the interface (save/read/delete by path) stays the same.
"""
import mimetypes
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


class UploadValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


async def save_upload(file: UploadFile, employee_id: uuid.UUID) -> tuple[str, str, int]:
    """Validates and persists an uploaded file. Returns (file_path, mime_type, size_bytes)."""

    # MIME check: trust neither the client-sent content_type nor the
    # extension alone — cross-check the extension against Python's own
    # mimetypes table so a renamed .exe can't slip through as .pdf.
    guessed_type, _ = mimetypes.guess_type(file.filename or "")
    mime_type = guessed_type or file.content_type or "application/octet-stream"

    if mime_type not in settings.ALLOWED_UPLOAD_MIME_TYPES:
        raise UploadValidationError(
            f"File type '{mime_type}' is not allowed. Allowed types: PDF, JPG, PNG."
        )

    contents = await file.read()
    size_bytes = len(contents)
    if size_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        raise UploadValidationError(f"File exceeds the {max_mb} MB size limit.")
    if size_bytes == 0:
        raise UploadValidationError("Uploaded file is empty.")

    employee_dir = Path(settings.UPLOAD_ROOT) / str(employee_id)
    employee_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "").suffix
    safe_name = f"{uuid.uuid4()}{extension}"
    dest_path = employee_dir / safe_name

    with open(dest_path, "wb") as f:
        f.write(contents)

    return str(dest_path), mime_type, size_bytes


def delete_file(file_path: str) -> None:
    path = Path(file_path)
    if path.exists():
        path.unlink()

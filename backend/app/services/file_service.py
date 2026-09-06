from pathlib import Path

import filetype
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.services.storage import storage

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

EXTENSION_TO_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
}

MIME_TO_EXTENSION = {v: k for k, v in EXTENSION_TO_MIME.items()}


async def _read_upload(file: UploadFile, max_size: int) -> bytes:
    content = await file.read(max_size + 1)
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File exceeds the maximum allowed size of {max_size // (1024 * 1024)}MB",
        )
    return content


def _validate_extension(filename: str, allowed: set[str]) -> None:
    extension = Path(filename or "").suffix.lower()
    if extension not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{extension}'",
        )


def _validate_mime(content_type: str | None, allowed: set[str]) -> None:
    if content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type",
        )


def _validate_magic_bytes(content: bytes, filename: str, allowed_mimes: set[str]) -> None:
    kind = filetype.guess(content)
    sniffed_mime = kind.mime if kind else None

    if sniffed_mime not in allowed_mimes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type",
        )

    extension = Path(filename or "").suffix.lower()
    expected_mime = EXTENSION_TO_MIME.get(extension)
    if expected_mime and sniffed_mime != expected_mime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match its extension",
        )


async def save_image(file: UploadFile, folder: str) -> str:
    _validate_extension(file.filename or "", ALLOWED_IMAGE_EXTENSIONS)
    _validate_mime(file.content_type, ALLOWED_IMAGE_TYPES)
    content = await _read_upload(file, settings.max_image_size_bytes)
    _validate_magic_bytes(content, file.filename or "", ALLOWED_IMAGE_TYPES)
    return storage.save(folder, file.filename or "image", content)


async def save_resume(file: UploadFile, folder: str = "resumes") -> str:
    if (file.content_type or "") != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume must be a PDF file",
        )
    _validate_extension(file.filename or "", {".pdf"})
    content = await _read_upload(file, settings.max_resume_size_bytes)
    _validate_magic_bytes(content, file.filename or "", {"application/pdf"})
    return storage.save(folder, file.filename or "resume.pdf", content)


def delete_file(url: str) -> None:
    storage.delete(url)
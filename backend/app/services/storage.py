import os
import shutil
import uuid
from abc import ABC, abstractmethod
from pathlib import Path

from app.core.config import settings


class StorageService(ABC):
    @abstractmethod
    def save(self, folder: str, filename: str, content: bytes) -> str:
        ...

    @abstractmethod
    def delete(self, url: str) -> None:
        ...


class LocalStorageService(StorageService):
    def __init__(self, root: str | Path | None = None) -> None:
        self.root = Path(root or settings.upload_dir)

    def _folder_path(self, folder: str) -> Path:
        path = self.root / folder
        path.mkdir(parents=True, exist_ok=True)
        return path

    def save(self, folder: str, filename: str, content: bytes) -> str:
        safe_name = f"{uuid.uuid4().hex}_{os.path.basename(filename)}"
        target = self._folder_path(folder) / safe_name
        target.write_bytes(content)
        return f"/uploads/{folder}/{safe_name}"

    def delete(self, url: str) -> None:
        if not url.startswith("/uploads/"):
            return
        path = self.root / url.removeprefix("/uploads/")
        if path.is_file():
            path.unlink()


class CloudStorageService(StorageService):
    def save(self, folder: str, filename: str, content: bytes) -> str:
        raise NotImplementedError("Cloud storage is not configured yet")

    def delete(self, url: str) -> None:
        raise NotImplementedError("Cloud storage is not configured yet")


def get_storage_service() -> StorageService:
    driver = settings.storage_driver.lower()
    if driver == "cloud":
        return CloudStorageService()
    return LocalStorageService()


storage = get_storage_service()
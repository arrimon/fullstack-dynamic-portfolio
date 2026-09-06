import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models.user import User

logger = logging.getLogger(__name__)


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None or not verify_password(password, user.password):
        return None
    return user


def ensure_admin_exists(db: Session) -> None:
    if not settings.admin_password:
        logger.warning(
            "ADMIN_PASSWORD not set; skipping admin user seed "
            "(set ADMIN_* environment variables to create the admin account)"
        )
        return

    exists = db.scalar(select(User.id).where(User.email == settings.admin_email.lower()))
    if exists is not None:
        return

    admin = User(
        name=settings.admin_name,
        email=settings.admin_email.lower(),
        password=hash_password(settings.admin_password),
    )
    db.add(admin)
    db.commit()
    logger.info("Admin user seeded: %s", settings.admin_email)
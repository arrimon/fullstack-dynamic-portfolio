import os

# Test environment is fully self-contained and must not depend on the
# developer's local .env file. Everything the app needs at startup is pinned
# here so tests behave the same on every machine.
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://pgsql_user:User%40%40123@localhost:5432/portfolio_test",
)
TEST_UPLOAD_DIR = "/tmp/opencode/portfolio-test-uploads"
TEST_JWT_SECRET = "test-only-secret-please-ignore-0123456789abcdef"

os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["UPLOAD_DIR"] = TEST_UPLOAD_DIR
os.environ["DEBUG"] = "true"
os.environ["JWT_SECRET_KEY"] = TEST_JWT_SECRET
os.environ["ADMIN_NAME"] = "Test Admin"
os.environ["ADMIN_EMAIL"] = "admin@example.com"
os.environ["ADMIN_PASSWORD"] = "change-me"
os.environ["MAIL_USERNAME"] = ""
os.environ["MAIL_PASSWORD"] = ""

import pytest
from alembic import command as alembic_command
from alembic.config import Config
from fastapi.testclient import TestClient

from app.core.database import SessionLocal, engine
from app.core.rate_limit import limiter
from app.main import app
from app.services.auth_service import ensure_admin_exists


@pytest.fixture(scope="session", autouse=True)
def prepare_database():
    os.makedirs(TEST_UPLOAD_DIR, exist_ok=True)
    alembic_config = Config("alembic.ini")
    alembic_command.upgrade(alembic_config, "head")
    yield


@pytest.fixture(autouse=True)
def clean_tables(prepare_database):
    limiter.reset()
    with engine.begin() as connection:
        connection.execute(
            __import__("sqlalchemy").text(
                "TRUNCATE TABLE users, technologies, projects, project_images, "
                "project_technology, experience, education, certifications, resume, "
                "contact_messages, site_settings, social_links, testimonials "
                "RESTART IDENTITY CASCADE"
            )
        )
    with SessionLocal() as db:
        ensure_admin_exists(db)
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db():
    with SessionLocal() as session:
        yield session


@pytest.fixture
def admin_token(client) -> str:
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "change-me"},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(admin_token) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}
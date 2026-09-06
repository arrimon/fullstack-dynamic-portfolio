from sqlalchemy import select

from app.models.contact_message import ContactMessage


def _submit(client, **overrides):
    payload = {
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Project Inquiry",
        "message": "I would like to discuss a project.",
    }
    payload.update(overrides)
    return client.post("/api/contact", json=payload)


def test_valid_contact_submission(client, db):
    response = _submit(client)
    assert response.status_code == 201
    assert response.json()["status"] == "ok"

    message = db.scalar(select(ContactMessage))
    assert message is not None
    assert message.name == "John Doe"
    assert message.email == "john@example.com"
    assert message.is_read is False


def test_contact_database_persistence(client, db):
    _submit(client)
    messages = db.scalars(select(ContactMessage)).all()
    assert len(messages) == 1
    assert messages[0].message == "I would like to discuss a project."


def test_invalid_email_rejected(client):
    response = _submit(client, email="not-an-email")
    assert response.status_code == 422


def test_empty_message_rejected(client):
    response = _submit(client, message="   ")
    assert response.status_code == 422


def test_rate_limit(client):
    first = _submit(client)
    assert first.status_code == 201
    second = _submit(client, message="another message")
    assert second.status_code == 429


def test_honeypot_not_persisted(client, db):
    response = _submit(client, website="http://spam.example.com")
    assert response.status_code == 201
    messages = db.scalars(select(ContactMessage)).all()
    assert len(messages) == 0


# TC-91-fix: honeypot submissions must NOT consume the visitor's rate-limit slot.
def test_honeypot_does_not_consume_rate_limit(client, db):
    honeypot = _submit(client, website="http://spam.example.com")
    assert honeypot.status_code == 201

    genuine = _submit(client)
    assert genuine.status_code == 201
    assert db.scalar(select(ContactMessage)) is not None


def test_rate_limit_still_applies_for_genuine_traffic(client):
    first = _submit(client)
    assert first.status_code == 201
    second = _submit(client, message="another message")
    assert second.status_code == 429
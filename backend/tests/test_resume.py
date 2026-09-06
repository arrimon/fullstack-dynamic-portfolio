PDF_BYTES = b"%PDF-1.4" + b"0" * 1024


def _upload(client, auth_headers, version_label="v1", content=PDF_BYTES,
            content_type="application/pdf", filename="resume.pdf"):
    return client.post(
        "/api/admin/resume",
        headers=auth_headers,
        files={"file": (filename, content, content_type)},
        data={"version_label": version_label},
    )


def test_upload_resume(client, auth_headers):
    response = _upload(client, auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["is_active"] is True
    assert data["file_url"].startswith("/uploads/resumes/")
    assert data["version_label"] == "v1"


def test_previous_resume_becomes_inactive(client, auth_headers, db):
    _upload(client, auth_headers, "v1")
    _upload(client, auth_headers, "v2")

    from sqlalchemy import select

    from app.models.resume import Resume

    resumes = db.scalars(select(Resume).order_by(Resume.id)).all()
    assert resumes[0].is_active is False
    assert resumes[1].is_active is True
    active = db.scalars(select(Resume).where(Resume.is_active.is_(True))).all()
    assert len(active) == 1


def test_only_active_resume_returned_publicly(client, auth_headers):
    _upload(client, auth_headers, "v1")
    _upload(client, auth_headers, "v2")
    response = client.get("/api/resume")
    assert response.status_code == 200
    assert response.json()["version_label"] == "v2"


def test_public_resume_404_when_none(client):
    response = client.get("/api/resume")
    assert response.status_code == 404


def test_invalid_file_type_rejected(client, auth_headers):
    response = _upload(
        client, auth_headers, content_type="image/png", filename="resume.png"
    )
    assert response.status_code == 400


# TC-198-fix: resume bytes must actually be a PDF, not just named/typed as one.
def test_fake_pdf_rejected(client, auth_headers):
    response = _upload(
        client, auth_headers,
        content_type="application/pdf", filename="resume.pdf",
        content=b"this is not a real pdf, just plain text",
    )
    assert response.status_code == 400
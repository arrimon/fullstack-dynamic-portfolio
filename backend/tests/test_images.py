import os

from app.core.config import settings

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"0" * 1024
JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"0" * 1024
WEBP_BYTES = b"RIFF" + (b"\x00" * 4) + b"WEBPVP8 " + (b"\x00" * 1024)


def _upload_image(client, auth_headers, project_id, filename="image.png",
                  content_type="image/png", content=PNG_BYTES):
    return client.post(
        f"/api/admin/projects/{project_id}/images",
        headers=auth_headers,
        files={"images": (filename, content, content_type)},
    )


def _create_project(client, auth_headers):
    response = client.post(
        "/api/admin/projects",
        headers=auth_headers,
        json={
            "title": "Image Project",
            "short_description": "short",
            "description": "full description",
            "status": "published",
        },
    )
    return response.json()


def _upload_dir() -> str:
    projects_dir = os.path.join(settings.upload_dir, "projects")
    os.makedirs(projects_dir, exist_ok=True)
    return projects_dir


def _upload_dir_files() -> set[str]:
    return set(os.listdir(_upload_dir()))


def test_valid_image_upload(client, auth_headers):
    project = _create_project(client, auth_headers)
    response = _upload_image(client, auth_headers, project["id"])
    assert response.status_code == 201
    data = response.json()
    assert len(data) == 1
    assert data[0]["image_url"].startswith("/uploads/projects/")


def test_invalid_file_type_rejected(client, auth_headers):
    project = _create_project(client, auth_headers)
    response = _upload_image(
        client, auth_headers, project["id"], filename="file.txt", content_type="text/plain"
    )
    assert response.status_code == 400


def test_invalid_mime_rejected(client, auth_headers):
    project = _create_project(client, auth_headers)
    response = _upload_image(
        client, auth_headers, project["id"], content_type="application/octet-stream"
    )
    assert response.status_code == 400


def test_oversized_image_rejected(client, auth_headers):
    project = _create_project(client, auth_headers)
    response = _upload_image(client, auth_headers, project["id"], content=b"x" * (5 * 1024 * 1024 + 1))
    assert response.status_code == 413


def test_image_deletion(client, auth_headers):
    project = _create_project(client, auth_headers)
    uploaded = _upload_image(client, auth_headers, project["id"]).json()
    image_id = uploaded[0]["id"]
    response = client.delete(
        f"/api/admin/project-images/{image_id}", headers=auth_headers
    )
    assert response.status_code == 204
    assert client.get(f"/api/admin/projects/{project['id']}", headers=auth_headers).json()["images"] == []


# TC-198-fix: file type is now validated by magic bytes, not just extension/MIME.
def test_plain_text_disguised_as_png_rejected(client, auth_headers):
    project = _create_project(client, auth_headers)
    before = _upload_dir_files()
    response = _upload_image(
        client, auth_headers, project["id"],
        filename="fake.png", content_type="image/png", content=b"plain text, not an image",
    )
    assert response.status_code == 400
    assert _upload_dir_files() == before


def test_valid_jpeg_and_webp_uploads_accepted(client, auth_headers):
    project = _create_project(client, auth_headers)
    jpeg = _upload_image(
        client, auth_headers, project["id"],
        filename="pic.jpg", content_type="image/jpeg", content=JPEG_BYTES,
    )
    assert jpeg.status_code == 201
    webp = _upload_image(
        client, auth_headers, project["id"],
        filename="pic.webp", content_type="image/webp", content=WEBP_BYTES,
    )
    assert webp.status_code == 201
    assert any(name.endswith(".jpg") for name in _upload_dir_files())
    assert any(name.endswith(".webp") for name in _upload_dir_files())


def test_svg_disguised_as_png_rejected(client, auth_headers):
    project = _create_project(client, auth_headers)
    before = _upload_dir_files()
    response = _upload_image(
        client, auth_headers, project["id"],
        filename="logo.png", content_type="image/png",
        content=b'<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    )
    assert response.status_code == 400
    assert _upload_dir_files() == before
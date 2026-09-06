def _create_technology(client, auth_headers, name="FastAPI"):
    response = client.post(
        "/api/admin/technologies",
        headers=auth_headers,
        json={"name": name, "category": "backend"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def _create_project(client, auth_headers, **overrides):
    payload = {
        "title": "Expense Tracker",
        "short_description": "Track your expenses",
        "description": "A full featured expense tracking application.",
        "status": "published",
        "display_order": 1,
    }
    payload.update(overrides)
    response = client.post("/api/admin/projects", headers=auth_headers, json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def test_create_project_generates_slug(client, auth_headers):
    project = _create_project(client, auth_headers)
    assert project["slug"] == "expense-tracker"


def test_duplicate_title_gets_unique_slug(client, auth_headers):
    _create_project(client, auth_headers)
    second = _create_project(client, auth_headers)
    assert second["slug"] == "expense-tracker-2"


def test_update_project(client, auth_headers):
    project = _create_project(client, auth_headers)
    response = client.put(
        f"/api/admin/projects/{project['id']}",
        headers=auth_headers,
        json={"title": "Renamed Project", "is_featured": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Renamed Project"
    assert data["is_featured"] is True
    assert data["slug"] == "renamed-project"


def test_delete_project_is_soft_delete(client, auth_headers, db):
    project = _create_project(client, auth_headers)
    response = client.delete(f"/api/admin/projects/{project['id']}", headers=auth_headers)
    assert response.status_code == 204
    from sqlalchemy import select

    from app.models.project import Project

    stored = db.scalar(select(Project).where(Project.id == project["id"]))
    assert stored is not None
    assert stored.deleted_at is not None


def test_restore_project(client, auth_headers):
    project = _create_project(client, auth_headers)
    client.delete(f"/api/admin/projects/{project['id']}", headers=auth_headers)
    response = client.post(
        f"/api/admin/projects/{project['id']}/restore", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["deleted_at"] is None


def test_published_project_appears_publicly(client, auth_headers):
    _create_project(client, auth_headers)
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert response.json()["total"] == 1


def test_draft_project_hidden_publicly(client, auth_headers):
    _create_project(client, auth_headers, status="draft")
    response = client.get("/api/projects")
    assert response.json()["total"] == 0


def test_deleted_project_hidden_publicly(client, auth_headers):
    project = _create_project(client, auth_headers)
    client.delete(f"/api/admin/projects/{project['id']}", headers=auth_headers)
    response = client.get("/api/projects")
    assert response.json()["total"] == 0


def test_project_slug_lookup(client, auth_headers):
    _create_project(client, auth_headers)
    response = client.get("/api/projects/expense-tracker")
    assert response.status_code == 200
    assert response.json()["title"] == "Expense Tracker"


def test_project_slug_lookup_draft_returns_404(client, auth_headers):
    _create_project(client, auth_headers, status="draft")
    response = client.get("/api/projects/expense-tracker")
    assert response.status_code == 404


def test_project_technology_relationships(client, auth_headers):
    tech = _create_technology(client, auth_headers)
    project = _create_project(client, auth_headers, technology_ids=[tech["id"]])
    detail = client.get(
        f"/api/admin/projects/{project['id']}", headers=auth_headers
    ).json()
    assert [t["id"] for t in detail["technologies"]] == [tech["id"]]

    public = client.get("/api/projects/expense-tracker").json()
    assert [t["name"] for t in public["technologies"]] == ["FastAPI"]


def test_featured_filter(client, auth_headers):
    _create_project(client, auth_headers, title="A", is_featured=True)
    _create_project(client, auth_headers, title="B", is_featured=False)
    response = client.get("/api/projects?featured=true")
    assert response.json()["total"] == 1


def test_project_order_and_pagination(client, auth_headers):
    _create_project(client, auth_headers, title="Second", display_order=2)
    _create_project(client, auth_headers, title="First", display_order=1)
    response = client.get("/api/projects")
    titles = [item["title"] for item in response.json()["items"]]
    assert titles == ["First", "Second"]
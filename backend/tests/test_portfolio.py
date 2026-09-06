def test_experience_crud_and_public_list(client, auth_headers):
    payload = {
        "company_name": "Acme Corp",
        "position": "Backend Engineer",
        "employment_type": "full-time",
        "description": "Built APIs",
        "start_date": "2023-01-01",
        "is_current": True,
        "display_order": 2,
    }
    created = client.post("/api/admin/experience", headers=auth_headers, json=payload)
    assert created.status_code == 201
    assert created.json()["end_date"] is None

    experience_id = created.json()["id"]
    updated = client.put(
        f"/api/admin/experience/{experience_id}",
        headers=auth_headers,
        json={"position": "Senior Backend Engineer", "display_order": 1},
    )
    assert updated.status_code == 200
    assert updated.json()["position"] == "Senior Backend Engineer"

    public = client.get("/api/experience")
    assert public.status_code == 200
    assert [item["id"] for item in public.json()] == [experience_id]

    deleted = client.delete(
        f"/api/admin/experience/{experience_id}", headers=auth_headers
    )
    assert deleted.status_code == 204
    assert client.get("/api/experience").json() == []


def test_education_crud_and_public_list(client, auth_headers):
    payload = {
        "institution": "State University",
        "degree": "BSc Computer Science",
        "field_of_study": "CS",
        "start_date": "2018-01-01",
        "end_date": "2022-01-01",
        "grade": "A",
        "display_order": 1,
    }
    created = client.post("/api/admin/education", headers=auth_headers, json=payload)
    assert created.status_code == 201
    assert created.json()["institution"] == "State University"

    education_id = created.json()["id"]
    response = client.get("/api/education")
    assert response.status_code == 200
    assert response.json()[0]["id"] == education_id

    deleted = client.delete(f"/api/admin/education/{education_id}", headers=auth_headers)
    assert deleted.status_code == 204


def test_certifications_crud_and_public_list(client, auth_headers):
    payload = {
        "title": "AWS Certified Developer",
        "issuing_organization": "Amazon Web Services",
        "issue_date": "2023-06-01",
        "credential_url": "https://example.com/credential",
    }
    created = client.post(
        "/api/admin/certifications", headers=auth_headers, json=payload
    )
    assert created.status_code == 201

    certification_id = created.json()["id"]
    response = client.get("/api/certifications")
    assert response.status_code == 200
    assert response.json()[0]["id"] == certification_id

    updated = client.put(
        f"/api/admin/certifications/{certification_id}",
        headers=auth_headers,
        json={"title": "AWS Certified Solutions Architect"},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "AWS Certified Solutions Architect"


def test_technologies_crud(client, auth_headers):
    created = client.post(
        "/api/admin/technologies",
        headers=auth_headers,
        json={"name": "PostgreSQL", "category": "database"},
    )
    assert created.status_code == 201
    tech_id = created.json()["id"]

    duplicate = client.post(
        "/api/admin/technologies",
        headers=auth_headers,
        json={"name": "PostgreSQL", "category": "database"},
    )
    assert duplicate.status_code == 409

    updated = client.put(
        f"/api/admin/technologies/{tech_id}",
        headers=auth_headers,
        json={"name": "PostgreSQL 16"},
    )
    assert updated.status_code == 200

    listed = client.get("/api/admin/technologies", headers=auth_headers)
    assert listed.status_code == 200
    assert [t["name"] for t in listed.json()] == ["PostgreSQL 16"]

    deleted = client.delete(f"/api/admin/technologies/{tech_id}", headers=auth_headers)
    assert deleted.status_code == 204


def test_site_settings_update_and_public(client, auth_headers):
    payload = {"settings": {"hero_title": "Hello", "hero_subtitle": "World"}}
    updated = client.put("/api/admin/settings", headers=auth_headers, json=payload)
    assert updated.status_code == 200
    assert updated.json() == payload["settings"]

    public = client.get("/api/settings")
    assert public.status_code == 200
    keys = {item["key"] for item in public.json()}
    assert keys == {"hero_title", "hero_subtitle"}


def test_social_links_crud_and_public(client, auth_headers):
    created = client.post(
        "/api/admin/social-links",
        headers=auth_headers,
        json={"platform": "github", "url": "https://github.com/user"},
    )
    assert created.status_code == 201
    link_id = created.json()["id"]

    updated = client.put(
        f"/api/admin/social-links/{link_id}",
        headers=auth_headers,
        json={"url": "https://github.com/new-user"},
    )
    assert updated.status_code == 200
    assert updated.json()["url"] == "https://github.com/new-user"

    public = client.get("/api/social-links")
    assert public.status_code == 200
    assert public.json()[0]["platform"] == "github"

    deleted = client.delete(f"/api/admin/social-links/{link_id}", headers=auth_headers)
    assert deleted.status_code == 204
    assert client.get("/api/social-links").json() == []


def test_admin_contact_messages(client, auth_headers):
    client.post(
        "/api/contact",
        json={"name": "Sender", "email": "sender@example.com", "message": "Hello"},
    )
    listed = client.get("/api/admin/contact-messages", headers=auth_headers)
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    message_id = listed.json()["items"][0]["id"]
    assert listed.json()["items"][0]["is_read"] is False

    patched = client.patch(
        f"/api/admin/contact-messages/{message_id}",
        headers=auth_headers,
        json={"is_read": True},
    )
    assert patched.status_code == 200
    assert patched.json()["is_read"] is True

    unread = client.get(
        "/api/admin/contact-messages?is_read=false", headers=auth_headers
    )
    assert unread.json()["total"] == 0
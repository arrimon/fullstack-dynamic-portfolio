from __future__ import annotations


def test_testimonials_crud_and_public(client, auth_headers):
    payload = {
        "client_name": "Jane Cooper",
        "client_role": "Product Manager",
        "company_name": "Acme Corp",
        "review_text": "Absolutely fantastic to work with.",
        "rating": 5,
        "display_order": 2,
        "is_active": True,
    }
    created = client.post(
        "/api/admin/testimonials", headers=auth_headers, json=payload
    )
    assert created.status_code == 201
    testimonial_id = created.json()["id"]
    assert created.json()["rating"] == 5

    updated = client.put(
        f"/api/admin/testimonials/{testimonial_id}",
        headers=auth_headers,
        json={"rating": 4, "is_active": True},
    )
    assert updated.status_code == 200
    assert updated.json()["rating"] == 4

    public = client.get("/api/testimonials")
    assert public.status_code == 200
    assert [t["id"] for t in public.json()] == [testimonial_id]

    deleted = client.delete(
        f"/api/admin/testimonials/{testimonial_id}", headers=auth_headers
    )
    assert deleted.status_code == 204
    assert client.get("/api/testimonials").json() == []


def test_testimonials_reorder_and_inactive_hidden(client, auth_headers):
    ids = []
    for i, name in enumerate(["Alpha", "Beta", "Gamma"]):
        resp = client.post(
            "/api/admin/testimonials",
            headers=auth_headers,
            json={
                "client_name": name,
                "review_text": f"Review from {name}.",
                "rating": 5,
                "display_order": i,
            },
        )
        assert resp.status_code == 201
        ids.append(resp.json()["id"])

    # Reorder: reverse the order
    reorder = client.put(
        "/api/admin/testimonials/reorder",
        headers=auth_headers,
        json={"items": [{"id": ids[2], "display_order": 0}, {"id": ids[1], "display_order": 1}, {"id": ids[0], "display_order": 2}]},
    )
    assert reorder.status_code == 200
    assert [t["id"] for t in reorder.json()] == [ids[2], ids[1], ids[0]]

    # Deactivate one -> hidden from public API but present in admin list
    deactivated = client.put(
        f"/api/admin/testimonials/{ids[0]}",
        headers=auth_headers,
        json={"is_active": False},
    )
    assert deactivated.status_code == 200

    public = client.get("/api/testimonials")
    public_ids = [t["id"] for t in public.json()]
    assert ids[0] not in public_ids
    assert set(public_ids) == {ids[1], ids[2]}

    admin_list = client.get("/api/admin/testimonials", headers=auth_headers)
    assert len(admin_list.json()) == 3


def test_reorder_invalid_id_rolls_back(client, auth_headers):
    resp = client.post(
        "/api/admin/testimonials",
        headers=auth_headers,
        json={"client_name": "Only", "review_text": "Solo review.", "display_order": 1},
    )
    testimonial_id = resp.json()["id"]

    # First item valid, second one does not exist -> whole request fails
    failed = client.put(
        "/api/admin/testimonials/reorder",
        headers=auth_headers,
        json={
            "items": [
                {"id": testimonial_id, "display_order": 5},
                {"id": 999_999, "display_order": 6},
            ]
        },
    )
    assert failed.status_code == 404

    admin_list = client.get("/api/admin/testimonials", headers=auth_headers)
    assert admin_list.json()[0]["display_order"] == 1


def test_technologies_public_and_reorder(client, auth_headers):
    created = client.post(
        "/api/admin/technologies",
        headers=auth_headers,
        json={"name": "React", "category": "frontend", "display_order": 1},
    )
    assert created.status_code == 201
    react_id = created.json()["id"]

    created = client.post(
        "/api/admin/technologies",
        headers=auth_headers,
        json={"name": "FastAPI", "category": "backend", "display_order": 0},
    )
    assert created.status_code == 201
    fastapi_id = created.json()["id"]

    public = client.get("/api/technologies")
    assert public.status_code == 200
    assert [t["id"] for t in public.json()] == [fastapi_id, react_id]

    reorder = client.put(
        "/api/admin/technologies/reorder",
        headers=auth_headers,
        json={"items": [{"id": react_id, "display_order": 0}, {"id": fastapi_id, "display_order": 1}]},
    )
    assert reorder.status_code == 200
    assert [t["id"] for t in reorder.json()] == [react_id, fastapi_id]

    # Inactive technologies are hidden from the public list
    client.put(
        f"/api/admin/technologies/{fastapi_id}",
        headers=auth_headers,
        json={"is_active": False},
    )
    public = client.get("/api/technologies")
    assert [t["id"] for t in public.json()] == [react_id]


def test_projects_reorder(client, auth_headers):
    ids = []
    for i, title in enumerate(["First", "Second", "Third"]):
        resp = client.post(
            "/api/admin/projects",
            headers=auth_headers,
            json={
                "title": title,
                "short_description": f"Short {title}",
                "description": f"Long description for {title}.",
                "status": "published",
                "display_order": i,
            },
        )
        assert resp.status_code == 201
        ids.append(resp.json()["id"])

    reorder = client.put(
        "/api/admin/projects/reorder",
        headers=auth_headers,
        json={"items": [{"id": ids[2], "display_order": 0}, {"id": ids[0], "display_order": 1}, {"id": ids[1], "display_order": 2}]},
    )
    assert reorder.status_code == 200
    assert [p["id"] for p in reorder.json()] == [ids[2], ids[0], ids[1]]
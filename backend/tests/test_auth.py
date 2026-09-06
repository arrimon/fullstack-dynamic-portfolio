def test_valid_login(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "change-me"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]


def test_invalid_email(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "unknown@example.com", "password": "change-me"},
    )
    assert response.status_code == 401


def test_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_protected_route_without_token(client):
    response = client.get("/api/admin/projects")
    assert response.status_code == 401


def test_protected_route_with_invalid_token(client):
    response = client.get(
        "/api/admin/projects", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401
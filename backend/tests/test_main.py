"""Tests for the FastAPI app initialization."""


def test_app_exists(client):
    """App should be importable and respond to requests."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_cors_headers(client):
    """CORS headers should be present for allowed origins."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


def test_openapi_available(client):
    """OpenAPI schema should be served."""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data

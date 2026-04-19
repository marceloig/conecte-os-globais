"""Tests for the health check endpoint."""


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["message"] == "API is running successfully"


def test_health_response_schema(client):
    response = client.get("/api/v1/health")
    data = response.json()
    assert set(data.keys()) == {"status", "message"}

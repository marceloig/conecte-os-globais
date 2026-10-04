"""Tests for novela-related endpoints (TMDB image lookup only).

A rota /novelas/{name}/atores foi removida: a lógica de grafo agora vive no
frontend (Cytoscape), não no backend.
"""


def test_search_novela(client, mock_tmdb_service):
    mock_tmdb_service.search_tv_shows.return_value = {"poster_path": "/poster123.jpg"}

    response = client.get("/api/v1/novelas/Avenida Brasil")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Avenida Brasil"
    assert data["id"] == "Avenida Brasil"
    assert "poster123.jpg" in data["img"]
    mock_tmdb_service.search_tv_shows.assert_called_once_with("Avenida Brasil")


def test_search_novela_no_poster(client, mock_tmdb_service):
    mock_tmdb_service.search_tv_shows.return_value = {"poster_path": None}

    response = client.get("/api/v1/novelas/Novela Sem Poster")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Novela Sem Poster"


def test_novela_response_schema(client, mock_tmdb_service):
    mock_tmdb_service.search_tv_shows.return_value = {"poster_path": "/p.jpg"}

    response = client.get("/api/v1/novelas/Test")
    item = response.json()

    assert "id" in item
    assert "name" in item
    assert item["id"] == item["name"]

"""Tests for novela-related endpoints."""


def test_list_atores_by_novela(client, mock_repository):
    mock_repository.list_atores_by_novela.return_value = [
        "Fernanda Montenegro",
        "Tony Ramos",
    ]

    response = client.get("/api/v1/novelas/Avenida Brasil/atores")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Fernanda Montenegro"
    assert data[1]["name"] == "Tony Ramos"
    mock_repository.list_atores_by_novela.assert_called_once_with("Avenida Brasil")


def test_list_atores_by_novela_empty(client, mock_repository):
    mock_repository.list_atores_by_novela.return_value = []

    response = client.get("/api/v1/novelas/Novela Inexistente/atores")

    assert response.status_code == 200
    assert response.json() == []


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


def test_list_atores_response_schema(client, mock_repository):
    mock_repository.list_atores_by_novela.return_value = ["Ator A"]

    response = client.get("/api/v1/novelas/Test/atores")
    data = response.json()

    assert len(data) == 1
    item = data[0]
    assert "id" in item
    assert "name" in item
    assert item["id"] == item["name"]

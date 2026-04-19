"""Tests for actor-related endpoints."""
import pytest


def test_get_random_ator(client, mock_repository, mock_tmdb_service):
    mock_repository.get_random_atores.return_value = "Fernanda Montenegro"
    mock_tmdb_service.search_person.return_value = {"profile_path": "/abc123.jpg"}

    response = client.get("/api/v1/atores/random")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Fernanda Montenegro"
    assert data["id"] == "Fernanda Montenegro"
    assert "abc123.jpg" in data["img"]
    mock_repository.get_random_atores.assert_called_once()
    mock_tmdb_service.search_person.assert_called_once_with("Fernanda Montenegro")


def test_get_random_ator_no_tmdb_image(client, mock_repository, mock_tmdb_service):
    mock_repository.get_random_atores.return_value = "Ator Desconhecido"
    mock_tmdb_service.search_person.return_value = {"profile_path": None}

    response = client.get("/api/v1/atores/random")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Ator Desconhecido"
    assert "None" in data["img"]


def test_list_novelas_by_ator(client, mock_repository):
    mock_repository.list_novelas_by_ator.return_value = [
        "Avenida Brasil",
        "Caminho das Índias",
    ]

    response = client.get("/api/v1/atores/Fernanda Montenegro/novelas")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Avenida Brasil"
    assert data[1]["name"] == "Caminho das Índias"
    mock_repository.list_novelas_by_ator.assert_called_once_with("Fernanda Montenegro")


def test_list_novelas_by_ator_empty(client, mock_repository):
    mock_repository.list_novelas_by_ator.return_value = []

    response = client.get("/api/v1/atores/Ator Inexistente/novelas")

    assert response.status_code == 200
    assert response.json() == []


def test_search_ator(client, mock_tmdb_service):
    mock_tmdb_service.search_person.return_value = {"profile_path": "/xyz789.jpg"}

    response = client.get("/api/v1/atores/Tony Ramos")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Tony Ramos"
    assert data["id"] == "Tony Ramos"
    assert "xyz789.jpg" in data["img"]
    mock_tmdb_service.search_person.assert_called_once_with("Tony Ramos")


def test_list_novelas_response_schema(client, mock_repository):
    mock_repository.list_novelas_by_ator.return_value = ["Novela A"]

    response = client.get("/api/v1/atores/Test/novelas")
    data = response.json()

    assert len(data) == 1
    item = data[0]
    assert "id" in item
    assert "name" in item
    assert item["id"] == item["name"]

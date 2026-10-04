"""Tests for actor-related endpoints (TMDB image lookup only).

As rotas de grafo (/atores/random, /atores/{name}/novelas) foram removidas:
a lógica de grafo agora vive no frontend (Cytoscape), não no backend.
"""


def test_search_ator(client, mock_tmdb_service):
    mock_tmdb_service.search_person.return_value = {"profile_path": "/xyz789.jpg"}

    response = client.get("/api/v1/atores/Tony Ramos")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Tony Ramos"
    assert data["id"] == "Tony Ramos"
    assert "xyz789.jpg" in data["img"]
    mock_tmdb_service.search_person.assert_called_once_with("Tony Ramos")


def test_search_ator_no_tmdb_image(client, mock_tmdb_service):
    mock_tmdb_service.search_person.return_value = {"profile_path": None}

    response = client.get("/api/v1/atores/Ator Desconhecido")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Ator Desconhecido"
    assert "None" in data["img"]


def test_ator_response_schema(client, mock_tmdb_service):
    mock_tmdb_service.search_person.return_value = {"profile_path": "/a.jpg"}

    response = client.get("/api/v1/atores/Test")
    item = response.json()

    assert "id" in item
    assert "name" in item
    assert item["id"] == item["name"]


def test_removed_graph_routes_return_404(client):
    """As rotas de grafo com sufixo /novelas (que dependiam do Neo4j) não existem mais.

    Observação: GET /atores/random agora casa com /atores/{name} (name='random')
    e devolve uma busca TMDB — o sorteio aleatório passou a ser feito no frontend.
    """
    assert client.get("/api/v1/atores/Fulano/novelas").status_code == 404
    assert client.get("/api/v1/novelas/Alguma/atores").status_code == 404
    assert client.post("/api/v1/graph/shortest_path", json={}).status_code == 404

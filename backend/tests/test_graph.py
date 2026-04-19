"""Tests for the graph shortest path endpoint."""
from unittest.mock import MagicMock


def _make_mock_node(label: str, name: str):
    """Create a mock Neo4j node."""
    node = MagicMock()
    node.get.side_effect = lambda key: {
        "~label": label,
        "name": name,
    }.get(key)
    return node


def _make_mock_path(nodes_data: list[tuple[str, str]]):
    """Create a mock Neo4j Path with given nodes."""
    path = MagicMock()
    path.nodes = [_make_mock_node(label, name) for label, name in nodes_data]
    return path


def test_shortest_path_found(client, mock_repository):
    mock_path = _make_mock_path([
        ("Atores", "Fernanda Montenegro"),
        ("Novelas", "Avenida Brasil"),
        ("Atores", "Tony Ramos"),
    ])
    mock_repository.find_filter_shortest_path.return_value = {
        "path": mock_path,
        "grau": 2,
    }

    response = client.post("/api/v1/graph/shortest_path", json={
        "initial_nodes": [
            {"type": "ator", "name": "Fernanda Montenegro"},
            {"type": "ator", "name": "Tony Ramos"},
        ],
        "nodes": [
            {"type": "ator", "name": "Fernanda Montenegro"},
            {"type": "ator", "name": "Tony Ramos"},
            {"type": "novela", "name": "Avenida Brasil"},
        ],
    })

    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["grau"] == 2
    assert len(data["nodes"]) == 3
    assert data["nodes"][0]["name"] == "Fernanda Montenegro"
    assert data["nodes"][1]["name"] == "Avenida Brasil"
    assert data["nodes"][2]["name"] == "Tony Ramos"


def test_shortest_path_not_found(client, mock_repository):
    mock_repository.find_filter_shortest_path.return_value = None

    response = client.post("/api/v1/graph/shortest_path", json={
        "initial_nodes": [
            {"type": "ator", "name": "Ator A"},
            {"type": "ator", "name": "Ator B"},
        ],
        "nodes": [
            {"type": "ator", "name": "Ator A"},
            {"type": "ator", "name": "Ator B"},
        ],
    })

    assert response.status_code == 200
    data = response.json()
    assert data["found"] is False
    assert data["grau"] == 0
    assert data["nodes"] is None


def test_shortest_path_request_validation(client):
    # Missing required fields
    response = client.post("/api/v1/graph/shortest_path", json={})
    assert response.status_code == 422


def test_shortest_path_separates_atores_and_novelas(client, mock_repository):
    mock_repository.find_filter_shortest_path.return_value = None

    client.post("/api/v1/graph/shortest_path", json={
        "initial_nodes": [
            {"type": "ator", "name": "Ator A"},
            {"type": "ator", "name": "Ator B"},
        ],
        "nodes": [
            {"type": "ator", "name": "Ator A"},
            {"type": "ator", "name": "Ator B"},
            {"type": "novela", "name": "Novela X"},
            {"type": "novela", "name": "Novela Y"},
        ],
    })

    call_args = mock_repository.find_filter_shortest_path.call_args
    initial_atores, atores, novelas = call_args[0]
    assert initial_atores == ["Ator A", "Ator B"]
    assert atores == ["Ator A", "Ator B"]
    assert novelas == ["Novela X", "Novela Y"]

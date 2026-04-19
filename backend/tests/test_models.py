"""Tests for Pydantic models."""
import pytest
from app.models import (
    HealthResponse,
    Ator,
    Novela,
    GraphNode,
    PathRequest,
    PathResponse,
)


class TestHealthResponse:
    def test_create(self):
        h = HealthResponse(status="healthy", message="ok")
        assert h.status == "healthy"
        assert h.message == "ok"


class TestAtor:
    def test_create_with_img(self):
        a = Ator(id="1", name="Fernanda Montenegro", img="http://img.jpg")
        assert a.name == "Fernanda Montenegro"
        assert a.img == "http://img.jpg"

    def test_create_without_img(self):
        a = Ator(id="1", name="Test")
        assert a.img == ""

    def test_missing_required_fields(self):
        with pytest.raises(Exception):
            Ator()


class TestNovela:
    def test_create_with_img(self):
        n = Novela(id="1", name="Avenida Brasil", img="http://poster.jpg")
        assert n.name == "Avenida Brasil"
        assert n.img == "http://poster.jpg"

    def test_create_without_img(self):
        n = Novela(id="1", name="Test")
        assert n.img == ""


class TestGraphNode:
    def test_create(self):
        g = GraphNode(type="ator", name="Test")
        assert g.type == "ator"
        assert g.name == "Test"

    def test_missing_fields(self):
        with pytest.raises(Exception):
            GraphNode()


class TestPathRequest:
    def test_create(self):
        req = PathRequest(
            initial_nodes=[
                GraphNode(type="ator", name="A"),
                GraphNode(type="ator", name="B"),
            ],
            nodes=[
                GraphNode(type="ator", name="A"),
                GraphNode(type="novela", name="N"),
                GraphNode(type="ator", name="B"),
            ],
        )
        assert len(req.initial_nodes) == 2
        assert len(req.nodes) == 3


class TestPathResponse:
    def test_defaults(self):
        r = PathResponse()
        assert r.nodes is None
        assert r.grau == 0
        assert r.found is False

    def test_found_response(self):
        r = PathResponse(
            nodes=[GraphNode(type="ator", name="A")],
            grau=2,
            found=True,
        )
        assert r.found is True
        assert r.grau == 2
        assert len(r.nodes) == 1

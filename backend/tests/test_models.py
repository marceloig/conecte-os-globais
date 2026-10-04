"""Tests for Pydantic models."""
import pytest
from app.models import (
    HealthResponse,
    Ator,
    Novela,
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

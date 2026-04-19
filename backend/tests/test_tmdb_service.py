"""
Tests for TMDBService — tests the real class logic with mocked HTTP calls.
We import the real class via importlib to bypass the conftest mock.
"""
import os
import sys
import importlib
import pytest
from unittest.mock import AsyncMock


def _get_real_tmdb_class():
    """Load the real TMDBService class, bypassing the conftest mock."""
    spec = importlib.util.spec_from_file_location(
        "app.api.service_real",
        os.path.join(os.path.dirname(__file__), "..", "app", "api", "service.py"),
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.TMDBService


RealTMDBService = _get_real_tmdb_class()


def _make_service():
    """Create a real TMDBService instance without calling __init__."""
    svc = object.__new__(RealTMDBService)
    svc.api_token = "fake"
    svc.base_url = "https://api.themoviedb.org/3"
    svc.image_base_url = "https://image.tmdb.org/t/p"
    svc.headers = {"Authorization": "Bearer fake", "Content-Type": "application/json"}
    return svc


class TestTMDBServiceInit:
    def test_init_with_token(self):
        os.environ["TMDB_API_TOKEN"] = "test-token"
        try:
            svc = object.__new__(RealTMDBService)
            svc.__init__()
            assert svc.api_token == "test-token"
            assert "Bearer test-token" in svc.headers["Authorization"]
        finally:
            os.environ["TMDB_API_TOKEN"] = "fake-token"

    def test_init_without_token_raises(self):
        old = os.environ.pop("TMDB_API_TOKEN", None)
        try:
            with pytest.raises(ValueError, match="TMDB_API_TOKEN"):
                svc = object.__new__(RealTMDBService)
                svc.__init__()
        finally:
            if old is not None:
                os.environ["TMDB_API_TOKEN"] = old


class TestTMDBServiceImageUrl:
    def test_get_image_url(self):
        svc = _make_service()
        url = svc.get_image_url("/abc.jpg", "w500")
        assert url == "https://image.tmdb.org/t/p/w500/abc.jpg"

    def test_get_image_url_none(self):
        svc = _make_service()
        assert svc.get_image_url(None) is None

    def test_get_image_url_default_size(self):
        svc = _make_service()
        url = svc.get_image_url("/test.jpg")
        assert "w500" in url


class TestTMDBServiceSearchPerson:
    @pytest.mark.asyncio
    async def test_search_person_returns_first_result(self):
        svc = _make_service()
        mock_response = {
            "results": [
                {"id": 1, "name": "Fernanda Montenegro", "profile_path": "/fm.jpg"},
                {"id": 2, "name": "Fernanda Torres", "profile_path": "/ft.jpg"},
            ]
        }
        svc._make_request = AsyncMock(return_value=mock_response)
        result = await svc.search_person("Fernanda")
        assert result["name"] == "Fernanda Montenegro"

    @pytest.mark.asyncio
    async def test_search_person_empty_results(self):
        svc = _make_service()
        svc._make_request = AsyncMock(return_value={"results": []})
        result = await svc.search_person("Nobody")
        assert result == {}


class TestTMDBServiceSearchTvShows:
    @pytest.mark.asyncio
    async def test_search_tv_shows_returns_brazilian(self):
        svc = _make_service()
        mock_response = {
            "results": [
                {"id": 1, "name": "US Show", "origin_country": ["US"], "poster_path": "/us.jpg"},
                {"id": 2, "name": "Avenida Brasil", "origin_country": ["BR"], "poster_path": "/ab.jpg"},
            ]
        }
        svc._make_request = AsyncMock(return_value=mock_response)
        result = await svc.search_tv_shows("Avenida Brasil")
        assert result["name"] == "Avenida Brasil"
        assert result["origin_country"] == ["BR"]

    @pytest.mark.asyncio
    async def test_search_tv_shows_no_brazilian_result(self):
        svc = _make_service()
        mock_response = {
            "results": [
                {"id": 1, "name": "US Show", "origin_country": ["US"], "poster_path": "/us.jpg"},
            ]
        }
        svc._make_request = AsyncMock(return_value=mock_response)
        result = await svc.search_tv_shows("Something")
        assert result == {}

    @pytest.mark.asyncio
    async def test_search_tv_shows_empty_results(self):
        svc = _make_service()
        svc._make_request = AsyncMock(return_value={"results": []})
        result = await svc.search_tv_shows("Nothing")
        assert result == {}

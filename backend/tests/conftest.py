"""
Shared fixtures for backend tests.
Patches Neo4j and TMDB at module level so no real connections are made during import.
"""
import os
from unittest.mock import MagicMock, AsyncMock, patch

# Set required env vars BEFORE any app imports
os.environ["NEO4J_URI"] = "neo4j://localhost:7687"
os.environ["NEO4J_AUTH_USER"] = "neo4j"
os.environ["NEO4J_AUTH_PASSWORD"] = "test"
os.environ["TMDB_API_TOKEN"] = "fake-token"
os.environ["FRONTEND_URL"] = "http://localhost:5173"

# Patch Neo4jRepository and TMDBService BEFORE they get instantiated on import.
# The TMDB mock needs AsyncMock for its async methods (search_person, search_tv_shows, etc.)
_mock_repo_instance = MagicMock()
_mock_tmdb_instance = MagicMock()
# Make all TMDB methods that are awaited return AsyncMock
_mock_tmdb_instance.search_person = AsyncMock()
_mock_tmdb_instance.search_tv_shows = AsyncMock()
_mock_tmdb_instance.search_movies = AsyncMock()
_mock_tmdb_instance._make_request = AsyncMock()

_neo4j_patcher = patch("app.db.neo4j.Neo4jRepository", return_value=_mock_repo_instance)
_tmdb_patcher = patch("app.api.service.TMDBService", return_value=_mock_tmdb_instance)

_neo4j_patcher.start()
_tmdb_patcher.start()

# Now it's safe to import the app
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture()
def mock_repository():
    """Provides the mocked Neo4jRepository instance. Reset between tests."""
    _mock_repo_instance.reset_mock()
    return _mock_repo_instance


@pytest.fixture()
def mock_tmdb_service():
    """Provides the mocked TMDBService instance. Reset between tests."""
    _mock_tmdb_instance.reset_mock()
    # Re-assign AsyncMock after reset
    _mock_tmdb_instance.search_person = AsyncMock()
    _mock_tmdb_instance.search_tv_shows = AsyncMock()
    _mock_tmdb_instance.search_movies = AsyncMock()
    _mock_tmdb_instance._make_request = AsyncMock()
    return _mock_tmdb_instance


@pytest.fixture()
def client(mock_repository, mock_tmdb_service):
    """FastAPI TestClient with mocked dependencies."""
    return TestClient(app)

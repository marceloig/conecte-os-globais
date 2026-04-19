"""Tests for Settings / config."""
import os
import pytest


class TestSettings:
    def test_default_cors_origins(self):
        from app.core.config import Settings

        s = Settings(frontend_url="http://localhost:3000", cors_origins="")
        assert s.backend_cors_origins == ["http://localhost:3000"]

    def test_cors_origins_with_extra(self):
        from app.core.config import Settings

        s = Settings(
            frontend_url="http://localhost:3000",
            cors_origins="https://example.com,https://other.com",
        )
        origins = s.backend_cors_origins
        assert "http://localhost:3000" in origins
        assert "https://example.com" in origins
        assert "https://other.com" in origins
        assert len(origins) == 3

    def test_cors_origins_trims_whitespace(self):
        from app.core.config import Settings

        s = Settings(
            frontend_url="http://localhost:3000",
            cors_origins="  https://a.com , https://b.com  ",
        )
        origins = s.backend_cors_origins
        assert "https://a.com" in origins
        assert "https://b.com" in origins

    def test_cors_origins_ignores_empty_entries(self):
        from app.core.config import Settings

        s = Settings(
            frontend_url="http://localhost:3000",
            cors_origins="https://a.com,,, ,https://b.com",
        )
        origins = s.backend_cors_origins
        assert len(origins) == 3  # frontend_url + 2 valid origins

    def test_default_values(self):
        from app.core.config import Settings

        s = Settings()
        assert s.app_name == "Conecte os Globais API"
        assert s.version == "1.0.0"
        assert s.api_v1_str == "/api/v1"

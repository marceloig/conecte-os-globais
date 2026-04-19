---
inclusion: fileMatch
fileMatchPattern: "backend/**"
---

# Backend Development Standards

## Stack

- Python 3.11+, FastAPI 0.116.1, Pydantic 2.11, Neo4j driver 5.28, HTTPX 0.28
- Server: Uvicorn (ASGI)
- Config: pydantic-settings with `.env` files

## Project Structure

Follow the existing layout strictly:

```
backend/app/
├── main.py              # FastAPI app init, CORS, router mount
├── models.py            # All Pydantic models
├── api/
│   ├── service.py       # External API integrations (TMDB)
│   └── v1/
│       ├── api.py       # Router aggregation
│       └── endpoints.py # Route handlers
├── core/
│   └── config.py        # Settings via pydantic-settings
└── db/
    └── neo4j.py         # Neo4jRepository class
```

## Conventions

- All API routes go under `/api/v1` prefix
- Define Pydantic models in `models.py`, not inline in endpoints
- Database queries go in `Neo4jRepository` class in `db/neo4j.py`
- Use parameterized Cypher queries (never string interpolation)
- External API calls go in service classes under `api/service.py`
- Use `async def` for endpoint handlers
- Use `httpx.AsyncClient` for external HTTP calls (not `requests`)
- CORS origins come from `FRONTEND_URL` env var
- Never hardcode secrets — use environment variables via `dotenv`

## Neo4j Query Patterns

- Node labels: `Atores` (actors), `Novelas` (telenovelas)
- Relationship: `[:atua_em]` (acts in), direction: `(Ator)-[:atua_em]->(Novela)`
- Always use `$parameter` syntax for query parameters
- Use `shortestPath()` for path-finding queries

## Error Handling

- TMDB errors: map to appropriate HTTP status codes (401, 404, 504, 500)
- Neo4j connection: verified on repository init
- Use FastAPI's `HTTPException` for error responses

## Testing

- Use `pytest` with FastAPI's `TestClient`
- Test files in `backend/tests/`
- Run: `pytest` from `backend/` directory

## Build & Run

```bash
# Dev
uvicorn app.main:app --reload --port 8000

# Docker
docker-compose up --build

# Tests
pytest -v
```

---
inclusion: auto
---

# Conecte os Globais — Project Context

## What This Project Is

"Conecte os Globais" is an interactive graph-based game inspired by "Six Degrees of Separation". Players connect two randomly selected Brazilian TV actors through their shared participation in telenovelas. The game uses an interactive graph visualization built with React Flow.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite at `frontend/`
- **Backend**: FastAPI (Python 3.11+) at `backend/`
- **Database**: Neo4j graph database
- **External API**: TMDB for actor/telenovela images
- **Scraping**: Scrapy spider at `scrapy/memoriaglobo/`
- **Data files**: Neo4j import CSVs at `neo4j/`

## Key Directories

| Path | Purpose |
|------|---------|
| `frontend/src/components/` | React components (GraphNode, Modals, FuzzyText) |
| `frontend/src/config/env.ts` | Vite environment variables |
| `backend/app/api/v1/endpoints.py` | API route handlers |
| `backend/app/api/service.py` | TMDB API integration |
| `backend/app/db/neo4j.py` | Neo4j repository (Cypher queries) |
| `backend/app/models.py` | Pydantic data models |
| `backend/app/core/config.py` | Backend settings |
| `docs/` | Full technical documentation |

## API Base

All backend endpoints are prefixed with `/api/v1`. Swagger docs at `/docs`.

## Unit Tests — Mandatory on Every Change

Every code change in this project **must** include corresponding unit tests. No feature, bug fix, or refactor is considered complete without tests.

### Rules

- **New features**: write tests that cover the happy path and at least one error/edge case.
- **Bug fixes**: add a test that reproduces the bug before fixing it, ensuring it never regresses.
- **Refactors**: existing tests must keep passing. If behavior changes, update the tests accordingly.
- **Deleted code**: remove or update tests that covered the removed functionality.
- **Never skip tests** to make a change pass. Fix the root cause instead.

### Backend (pytest)

- **Location**: `backend/tests/`
- **Run**: `pytest -v` from `backend/`
- **Framework**: pytest + FastAPI `TestClient`
- **Fixtures**: shared mocks for Neo4j and TMDB in `backend/tests/conftest.py`
- **Pattern**: one test file per module (e.g., `test_atores.py` for actor endpoints, `test_models.py` for Pydantic models)
- Mock external dependencies (Neo4j, TMDB) — never make real network calls in tests

### Frontend (Vitest)

- **Location**: `frontend/src/tests/`
- **Run**: `npm run test` from `frontend/`
- **Framework**: Vitest + React Testing Library + jsdom
- **Setup**: global mocks in `frontend/src/tests/setup.ts`, shared render helpers in `frontend/src/tests/utils.tsx`
- **Pattern**: test files mirror the source structure (e.g., `tests/components/GraphNode.test.tsx` for `components/GraphNode.tsx`)
- Mock `axios` for API calls — never hit real endpoints in tests
- Use `renderWithProviders` (includes ReactFlowProvider + Radix Theme) for components that need those contexts
- Use `renderWithTheme` for components that only need Radix Theme

### Verification

After making changes, always run the relevant test suite to confirm nothing is broken:

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm run test
```

## Documentation Reference

Full technical documentation is available in `docs/`. Reference #[[file:docs/README.md]] for the index.

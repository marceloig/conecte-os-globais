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

## Documentation Reference

Full technical documentation is available in `docs/`. Reference #[[file:docs/README.md]] for the index.

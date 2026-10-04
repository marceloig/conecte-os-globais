# 07 — API Reference

O backend é **só-TMDB**: expõe apenas as rotas de imagem e o health check. As
consultas de grafo (ator aleatório, conexões, caminho mais curto) são feitas no
frontend e **não** têm endpoint.

## Base URL

```
http://localhost:8000/api/v1
```

## Documentação Interativa

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/api/v1/openapi.json`

---

## Endpoints

### Health Check

#### `GET /api/v1/health`

**Response** `200 OK`

```json
{
  "status": "healthy",
  "message": "API is running successfully"
}
```

---

### Imagens (TMDB)

#### `GET /api/v1/atores/{name}`

Retorna o nome do ator com a URL da imagem de perfil buscada no TMDB.

**Parâmetros de Path:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | string | Nome do ator |

**Response** `200 OK`

```json
{
  "id": "Fernanda Montenegro",
  "name": "Fernanda Montenegro",
  "img": "https://image.tmdb.org/t/p/original/path_to_image.jpg"
}
```

---

#### `GET /api/v1/novelas/{name}`

Retorna o nome da novela com a URL do poster buscado no TMDB.

**Parâmetros de Path:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | string | Nome da novela |

**Response** `200 OK`

```json
{
  "id": "Celebridade",
  "name": "Celebridade",
  "img": "https://image.tmdb.org/t/p/original/path_to_poster.jpg"
}
```

---

## O que mudou (consultas de grafo)

As rotas abaixo **não existem mais** — a lógica migrou para o frontend
(`src/lib/graph.ts`, Cytoscape headless):

| Antes (backend/Neo4j) | Agora (frontend/Cytoscape) |
|---|---|
| `GET /atores/random` | `getRandomAtor()` |
| `GET /atores/{name}/novelas` | `listNovelasByAtor(name)` |
| `GET /novelas/{name}/atores` | `listAtoresByNovela(name)` |
| `POST /graph/shortest_path` | `findFilterShortestPath(iniciais, jogados)` → `cy.aStar()` |

---

## Códigos de Erro (TMDB)

| Código | Descrição |
|--------|-----------|
| `401` | Token TMDB inválido |
| `404` | Recurso não encontrado na API TMDB |
| `504` | Timeout na requisição para TMDB |
| `500` | Erro interno do servidor |

## Autenticação

Os endpoints públicos não requerem autenticação. A autenticação com o TMDB é
feita internamente via Bearer token (`TMDB_API_TOKEN`).

## CORS

Origens permitidas via `FRONTEND_URL` (padrão `http://localhost:5173`) +
`CORS_ORIGINS` (lista separada por vírgulas). Métodos e headers: todos (`*`).

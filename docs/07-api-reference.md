# 07 — API Reference

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

Verifica o status da API.

**Response** `200 OK`

```json
{
  "status": "healthy",
  "message": "API is running successfully"
}
```

---

### Atores

#### `GET /api/v1/atores/random`

Retorna um ator aleatório do banco de dados, com imagem do TMDB.

**Response** `200 OK`

```json
{
  "id": "Fernanda Montenegro",
  "name": "Fernanda Montenegro",
  "img": "https://image.tmdb.org/t/p/original/path_to_image.jpg"
}
```

**Fluxo interno:**
1. Busca ator aleatório no Neo4j (`get_random_atores()`)
2. Busca imagem de perfil na API do TMDB (`search_person()`)
3. Retorna dados combinados

---

#### `GET /api/v1/atores/{name}`

Retorna detalhes de um ator específico com imagem do TMDB.

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

#### `GET /api/v1/atores/{name}/novelas`

Lista todas as novelas em que um ator participou.

**Parâmetros de Path:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | string | Nome do ator |

**Response** `200 OK`

```json
[
  {
    "id": "Cabocla - 2ª versão",
    "name": "Cabocla - 2ª versão",
    "img": ""
  },
  {
    "id": "Cambalacho",
    "name": "Cambalacho",
    "img": ""
  }
]
```

> Nota: O campo `img` não é preenchido neste endpoint (retorna string vazia). As imagens são buscadas sob demanda pelo frontend via `GET /novelas/{name}`.

---

### Novelas

#### `GET /api/v1/novelas/{name}`

Retorna detalhes de uma novela específica com poster do TMDB.

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

#### `GET /api/v1/novelas/{name}/atores`

Lista todos os atores que participaram de uma novela.

**Parâmetros de Path:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `name` | string | Nome da novela |

**Response** `200 OK`

```json
[
  {
    "id": "Afrânio Gama",
    "name": "Afrânio Gama",
    "img": ""
  },
  {
    "id": "Aisha Jambo",
    "name": "Aisha Jambo",
    "img": ""
  }
]
```

---

### Grafo / Jogo

#### `POST /api/v1/graph/shortest_path`

Verifica se existe um caminho válido entre os dois atores iniciais, passando apenas pelos nós que o jogador adicionou ao grafo.

**Request Body:**

```json
{
  "initial_nodes": [
    { "type": "ator", "name": "Fernanda Montenegro" },
    { "type": "ator", "name": "Tony Ramos" }
  ],
  "nodes": [
    { "type": "ator", "name": "Fernanda Montenegro" },
    { "type": "ator", "name": "Tony Ramos" },
    { "type": "novela", "name": "Celebridade" },
    { "type": "ator", "name": "Marcos Palmeira" }
  ]
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `initial_nodes` | `GraphNode[]` | Os 2 atores iniciais do jogo |
| `nodes` | `GraphNode[]` | Todos os nós no grafo (incluindo os iniciais) |

**Response — Caminho encontrado** `200 OK`

```json
{
  "nodes": [
    { "type": "ator", "name": "Fernanda Montenegro" },
    { "type": "novela", "name": "Celebridade" },
    { "type": "ator", "name": "Tony Ramos" }
  ],
  "grau": 2,
  "found": true
}
```

**Response — Caminho não encontrado** `200 OK`

```json
{
  "nodes": null,
  "grau": 0,
  "found": false
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nodes` | `GraphNode[] \| null` | Nós do caminho encontrado, ou null |
| `grau` | `int` | Grau de separação (número de arestas no caminho) |
| `found` | `bool` | Se o caminho foi encontrado |

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `401` | Token TMDB inválido |
| `404` | Recurso não encontrado na API TMDB |
| `504` | Timeout na requisição para TMDB |
| `500` | Erro interno do servidor |

## Autenticação

A API não requer autenticação para os endpoints públicos. A autenticação com o TMDB é feita internamente via Bearer token configurado no backend.

## CORS

Origens permitidas são configuradas via variável de ambiente `FRONTEND_URL` (padrão: `http://localhost:5173`).

Métodos e headers permitidos: todos (`*`).

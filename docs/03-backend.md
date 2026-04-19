# 03 — Backend (FastAPI)

## Estrutura de Diretórios

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Aplicação FastAPI principal
│   ├── models.py               # Modelos Pydantic
│   ├── api/
│   │   ├── __init__.py
│   │   ├── service.py          # Serviço de integração com TMDB
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py          # Configuração dos routers
│   │       └── endpoints.py    # Handlers das rotas
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py           # Configurações (Pydantic Settings)
│   └── db/
│       ├── __init__.py
│       └── neo4j.py            # Repositório Neo4j
├── tests/
│   ├── __init__.py
│   └── test_main.py            # Testes automatizados
├── .env                        # Variáveis de ambiente (não versionado)
├── .env.example                # Template de variáveis de ambiente
├── Dockerfile                  # Build multi-stage
├── docker-compose.yml          # Orquestração de containers
└── requirements.txt            # Dependências Python
```

## Aplicação Principal (`main.py`)

```python
app = FastAPI(
    title="Conecte os Globais API",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json"
)
```

- **CORS**: Configurado para aceitar requisições do frontend (`FRONTEND_URL`)
- **Router**: Todas as rotas são prefixadas com `/api/v1`
- **Documentação**: Swagger UI disponível em `/docs`, ReDoc em `/redoc`

## Modelos de Dados (`models.py`)

### HealthResponse

```python
class HealthResponse(BaseModel):
    status: str       # "healthy"
    message: str      # "API is running successfully"
```

### Ator

```python
class Ator(BaseModel):
    id: str           # Identificador (nome do ator)
    name: str         # Nome do ator
    img: Optional[str] = ''  # URL da imagem (TMDB)
```

### Novela

```python
class Novela(BaseModel):
    id: str           # Identificador (nome da novela)
    name: str         # Nome da novela
    img: Optional[str] = ''  # URL do poster (TMDB)
```

### GraphNode

```python
class GraphNode(BaseModel):
    type: str         # "ator" ou "novela"
    name: str         # Nome do nó
```

### PathRequest

```python
class PathRequest(BaseModel):
    initial_nodes: list[GraphNode]  # Os 2 atores iniciais do jogo
    nodes: list[GraphNode]          # Todos os nós adicionados pelo jogador
```

### PathResponse

```python
class PathResponse(BaseModel):
    nodes: list[GraphNode] = None   # Nós do caminho encontrado
    grau: int = 0                   # Grau de separação
    found: bool = False             # Se o caminho foi encontrado
```

## Repositório Neo4j (`db/neo4j.py`)

Classe `Neo4jRepository` que encapsula todas as queries ao banco de grafos.

### Conexão

```python
URI = getenv("NEO4J_URI")
AUTH = (getenv("NEO4J_AUTH_USER"), getenv("NEO4J_AUTH_PASSWORD"))

class Neo4jRepository:
    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)
        self.driver.verify_connectivity()
```

### Métodos

#### `get_random_atores() → str`

Retorna o nome de um ator aleatório do banco.

```cypher
MATCH (a:Atores)
RETURN a.name AS nome
ORDER BY rand()
LIMIT 1
```

#### `list_novelas_by_ator(ator: str) → list[str]`

Lista todas as novelas em que um ator participou.

```cypher
MATCH (a:Atores)-[:atua_em]->(n:Novelas)
WHERE a.name = $ator
RETURN n.name AS novela
ORDER BY n.name
```

#### `list_atores_by_novela(novela: str) → list[str]`

Lista todos os atores que participaram de uma novela.

```cypher
MATCH (a:Atores)-[:atua_em]->(n:Novelas)
WHERE n.name = $novela
RETURN a.name AS ator
ORDER BY a.name
```

#### `find_filter_shortest_path(initial_atores, atores, novelas) → dict`

Encontra o caminho mais curto entre dois atores, filtrando apenas pelos nós que o jogador adicionou ao grafo.

```cypher
MATCH path = shortestPath(
    (source:Atores {name: $source_ator})-[*]-(target:Atores {name: $target_ator})
)
WHERE ALL(n in nodes(path) WHERE
    (('Atores' IN labels(n) AND n.name IN $atores) OR
     ('Novelas' IN labels(n) AND n.name IN $novelas))
)
RETURN path, length(path) as grau
```

Esta é a query central do jogo. Ela usa a função `shortestPath` do Neo4j com um filtro `WHERE ALL` que garante que o caminho só passe por nós que o jogador efetivamente adicionou ao grafo.

## Serviço TMDB (`api/service.py`)

Classe `TMDBService` para integração com a API do [The Movie Database](https://www.themoviedb.org/).

### Configuração

- **Autenticação**: Bearer token via variável `TMDB_API_TOKEN`
- **Base URL**: `https://api.themoviedb.org/3`
- **Idioma padrão**: `pt-BR`
- **Timeout**: 30 segundos

### Métodos Principais

| Método | Descrição | Uso no Projeto |
|--------|-----------|----------------|
| `search_person(query)` | Busca pessoa por nome, retorna o primeiro resultado | Obter `profile_path` para foto do ator |
| `search_tv_shows(query)` | Busca séries/novelas, filtra por origem brasileira | Obter `poster_path` para poster da novela |
| `get_image_url(path, size)` | Constrói URL completa da imagem | Montar URL final das imagens |

### Tratamento de Erros

- **Timeout (504)**: Requisição excedeu 30s
- **Unauthorized (401)**: Token TMDB inválido
- **Not Found (404)**: Recurso não encontrado
- **Erro genérico (500)**: Falha interna

## Configuração (`core/config.py`)

Utiliza `pydantic-settings` para gerenciar configurações via variáveis de ambiente.

```python
class Settings(BaseSettings):
    app_name: str = "Conecte os Globais API"
    version: str = "1.0.0"
    debug: bool = False
    api_v1_str: str = "/api/v1"
    database_url: Optional[str] = None
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    backend_cors_origins: list[str] = [getenv("FRONTEND_URL", "http://localhost:5173")]
```

## Dependências (`requirements.txt`)

| Pacote | Versão | Uso |
|--------|--------|-----|
| `fastapi[standard]` | 0.116.1 | Framework web |
| `uvicorn[standard]` | 0.35.0 | Servidor ASGI |
| `pydantic` | 2.11.0 | Validação de dados |
| `pydantic-settings` | 2.10.1 | Configuração via env vars |
| `neo4j` | 5.28.1 | Driver do banco Neo4j |
| `httpx` | 0.28.1 | Cliente HTTP async (TMDB) |

## Testes (`tests/test_main.py`)

Testes básicos usando `pytest` e `TestClient` do FastAPI:

- `test_read_main()` — Verifica endpoint `/health` na raiz
- `test_health_endpoint()` — Verifica `GET /api/v1/health` retorna status "healthy"

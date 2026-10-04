# 03 — Backend (FastAPI)

O backend é um **proxy de imagens do TMDB**. Ele não tem banco de dados nem
lógica de grafo — isso vive no frontend (Cytoscape). Veja
[05 - Dados do Grafo](./05-banco-de-dados.md).

## Estrutura de Diretórios

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Aplicação FastAPI principal (+ load_dotenv)
│   ├── models.py               # Modelos Pydantic
│   ├── api/
│   │   ├── __init__.py
│   │   ├── service.py          # Serviço de integração com TMDB
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py          # Configuração dos routers
│   │       └── endpoints.py    # Handlers das rotas (só-TMDB) + health
│   └── core/
│       ├── __init__.py
│       └── config.py           # Configurações (Pydantic Settings)
├── tests/                      # Testes automatizados (pytest)
├── .env                        # Variáveis de ambiente (não versionado)
├── .env.example                # Template de variáveis de ambiente
├── Dockerfile                  # Build
├── docker-compose.yml          # Orquestração (apenas a API)
└── requirements.txt            # Dependências Python
```

## Aplicação Principal (`main.py`)

```python
from dotenv import load_dotenv
load_dotenv()  # carrega o .env antes dos imports que leem os.getenv (ex.: TMDBService)

app = FastAPI(
    title="Conecte os Globais API",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json"
)
```

- **`load_dotenv()`**: carrega o `.env` no ambiente logo no início, antes de
  qualquer import que leia `os.getenv` (notavelmente o `TMDBService`).
- **CORS**: aceita requisições do frontend (`FRONTEND_URL` + `CORS_ORIGINS`).
- **Router**: todas as rotas são prefixadas com `/api/v1`.
- **Documentação**: Swagger UI em `/docs`, ReDoc em `/redoc`.

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
    id: str                   # Identificador (nome do ator)
    name: str                 # Nome do ator
    img: Optional[str] = ''   # URL da imagem (TMDB)
```

### Novela

```python
class Novela(BaseModel):
    id: str                   # Identificador (nome da novela)
    name: str                 # Nome da novela
    img: Optional[str] = ''   # URL do poster (TMDB)
```

> Não há modelos de grafo (`GraphNode`/`PathRequest`/`PathResponse`): o grafo e
> o pathfinding são do frontend.

## Rotas (`api/v1/endpoints.py`)

```python
@router.get("/novelas/{name}", response_model=Novela)   # poster via TMDB
@router.get("/atores/{name}", response_model=Ator)       # perfil via TMDB
@router_health.get("/health", response_model=HealthResponse)
```

Cada rota de imagem chama o `TMDBService` e devolve a URL da imagem montada a
partir do `profile_path` / `poster_path` retornado pelo TMDB.

## Serviço TMDB (`api/service.py`)

Classe `TMDBService` para integração com a API do [The Movie Database](https://www.themoviedb.org/).

### Configuração

- **Autenticação**: Bearer token via variável `TMDB_API_TOKEN`
- **Base URL**: `https://api.themoviedb.org/3`
- **Idioma padrão**: `pt-BR`
- **Timeout**: 30 segundos

### Métodos usados pelo jogo

| Método | Descrição | Uso |
|--------|-----------|-----|
| `search_person(query)` | Busca pessoa por nome, retorna o primeiro resultado | `profile_path` (foto do ator) |
| `search_tv_shows(query)` | Busca séries/novelas, filtra por origem brasileira | `poster_path` (poster da novela) |

### Tratamento de Erros

- **Timeout (504)**: requisição excedeu 30s
- **Unauthorized (401)**: token TMDB inválido
- **Not Found (404)**: recurso não encontrado
- **Erro genérico (500)**: falha interna

## Configuração (`core/config.py`)

Utiliza `pydantic-settings` para gerenciar configurações via variáveis de ambiente.

```python
class Settings(BaseSettings):
    app_name: str = "Conecte os Globais API"
    version: str = "1.0.0"
    debug: bool = False
    api_v1_str: str = "/api/v1"
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = ""

    @computed_field
    @property
    def backend_cors_origins(self) -> list[str]:
        origins = [self.frontend_url]
        if self.cors_origins:
            origins.extend(o.strip() for o in self.cors_origins.split(",") if o.strip())
        return origins
```

## Dependências (`requirements.txt`)

| Pacote | Versão | Uso |
|--------|--------|-----|
| `fastapi[standard]` | 0.116.1 | Framework web |
| `uvicorn[standard]` | 0.35.0 | Servidor ASGI |
| `pydantic` | 2.11.0 | Validação de dados |
| `pydantic-settings` | 2.10.1 | Configuração via env vars |
| `python-dotenv` | 1.1.0 | Carga do `.env` no ambiente |
| `httpx` | 0.28.1 | Cliente HTTP async (TMDB) |

## Testes (`tests/`)

Testes com `pytest` e `TestClient` do FastAPI, mockando o `TMDBService`:

- `test_health.py` / `test_main.py` — health check
- `test_atores.py` / `test_novelas.py` — rotas de imagem (TMDB) e 404 das rotas de grafo removidas
- `test_models.py` — modelos `Ator`/`Novela`/`HealthResponse`
- `test_config.py` — configurações e CORS
- `test_tmdb_service.py` — serviço TMDB

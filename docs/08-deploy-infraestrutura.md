# 08 — Deploy e Infraestrutura

O backend é um serviço FastAPI **só-TMDB**, sem banco de dados. O frontend é
estático (dataset do grafo embarcado) e pode ser servido por qualquer CDN / host
estático.

## Docker

### Dockerfile (Backend)

Build multi-stage para otimizar o tamanho da imagem:

```dockerfile
# Stage 1: Builder — compila dependências em wheels
FROM python:3.13-slim as builder
WORKDIR /server
COPY ./requirements.txt /server/
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /server/wheels -r requirements.txt

# Stage 2: Runner — imagem final leve
FROM python:3.13-slim as runner
WORKDIR /server
COPY --from=builder /server/wheels /server/wheels
COPY --from=builder /server/requirements.txt .
RUN pip install --no-cache-dir /server/wheels/* \
    && pip install --no-cache-dir uvicorn
COPY . /server/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
    volumes:
      - .:/app              # Hot reload em desenvolvimento
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Serviços:**

| Serviço | Imagem | Porta | Descrição |
|---------|--------|-------|-----------|
| `api` | Build local | 8000 | Backend FastAPI (só-TMDB) com hot reload |

> Não há mais serviço de banco de dados no compose — o grafo vive no frontend.

**Comandos:**

```bash
docker-compose up --build       # subir
docker-compose up -d --build    # em background
docker-compose down             # parar
docker-compose logs -f api      # logs
```

## Variáveis de Ambiente

### Backend (`.env`)

```env
TMDB_API_TOKEN="seu_token_tmdb_aqui"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGINS="https://conecteosglobais.igormarcelo.dev.br"
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `TMDB_API_TOKEN` | Sim | Token Bearer da API do TMDB |
| `FRONTEND_URL` | Não | Origem do frontend para CORS (padrão: `http://localhost:5173`) |
| `CORS_ORIGINS` | Não | Origens adicionais para CORS, separadas por vírgula |

### Frontend (`.env`)

```env
VITE_API_ENDPOINT=http://localhost:8000
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_API_ENDPOINT` | Sim | URL base da API backend (imagens) |

> Variáveis prefixadas com `VITE_` são expostas ao código do frontend pelo Vite.

## Build do Frontend

O dataset do grafo é embarcado no bundle; gere-o antes do build se os CSVs mudaram:

```bash
cd frontend
npm ci
npm run build:graph        # src/data/graph.json
npm run build              # dist/ (estático)
```

Publique o conteúdo de `dist/` em qualquer host estático (S3 + CloudFront,
Vercel, Netlify, etc.).

## Infraestrutura AWS

### Backend em ECS (Fargate)

O backend FastAPI roda em **AWS ECS com Fargate**, containerizado via Docker.

#### Fluxo de Deploy

1. Build da imagem Docker a partir de `backend/Dockerfile`
2. Push da imagem para **Amazon ECR**
3. ECS Task Definition referencia a imagem do ECR
4. ECS Service mantém o container rodando no Fargate
5. API Gateway roteia requisições externas para o ECS Service

#### Variáveis de Ambiente no ECS

Configuradas na **Task Definition**:

| Variável | Valor em Produção |
|----------|-------------------|
| `TMDB_API_TOKEN` | Token da API TMDB |
| `FRONTEND_URL` | `https://conecteosglobais.igormarcelo.dev.br` |
| `CORS_ORIGINS` | `https://conecteosglobais.igormarcelo.dev.br` |

> Para segredos sensíveis (como o `TMDB_API_TOKEN`), use **AWS Secrets Manager**
> ou **SSM Parameter Store** referenciados na Task Definition.

#### CORS em Produção

`CORS_ORIGINS` aceita múltiplas origens separadas por vírgula, combinadas com
`FRONTEND_URL`:

```env
CORS_ORIGINS=https://conecteosglobais.igormarcelo.dev.br,https://outro-dominio.com
```

## Portas Utilizadas

| Porta | Serviço | Protocolo |
|-------|---------|-----------|
| `5173` | Frontend (Vite dev server) | HTTP |
| `8000` | Backend (FastAPI/Uvicorn) | HTTP |

## Diagrama de Deploy

### Desenvolvimento Local

```
┌─────────────────────────────────────────────┐
│              Máquina Local                   │
│                                             │
│  ┌──────────┐  ┌──────────┐                 │
│  │ Frontend │  │ Backend  │                 │
│  │ :5173    │─▶│ :8000    │──┐              │
│  │ (Vite +  │  │ (FastAPI │  │              │
│  │ graph.js)│  │  TMDB)   │  │              │
│  └──────────┘  └──────────┘  │              │
│                              ▼              │
│                      ┌──────────────┐       │
│                      │  TMDB API    │       │
│                      │  (externo)   │       │
│                      └──────────────┘       │
└─────────────────────────────────────────────┘
```

### Produção (AWS)

```
┌──────────────────────────────────────────────────────────────┐
│                         AWS Cloud                             │
│                                                              │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │  API Gateway     │    │  ECS Fargate                     │ │
│  │  (HTTPS)         │───▶│  Backend FastAPI :8000 (só-TMDB)  │ │
│  │                  │    │  (Docker container from ECR)      │ │
│  └─────────────────┘    └──────────────────┬───────────────┘ │
│                                            │                 │
│                                   ┌────────▼────────┐        │
│                                   │  TMDB API       │        │
│                                   │  (externo)      │        │
│                                   └─────────────────┘        │
└──────────────────────────────────────────────────────────────┘
                         ▲
                         │ HTTPS
          ┌──────────────┴──────────────┐
          │  Frontend (estático / CDN)  │
          │  graph.json embarcado        │
          │  conecteosglobais.          │
          │  igormarcelo.dev.br         │
          └─────────────────────────────┘
```

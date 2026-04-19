# 08 — Deploy e Infraestrutura

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

**Características:**
- Imagem base: `python:3.13-slim` (mínima)
- Dependências compiladas como wheels no stage de build
- Imagem final não contém ferramentas de compilação
- Porta exposta: `8000`

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
    depends_on:
      - db

  db:
    image: neo4j:2025.07.0
    environment:
      NEO4J_AUTH: conecte_os_globais
    ports:
      - "7474:7474"          # Neo4j Browser
    volumes:
      - neo4j_data:/var/lib/neo4j/data

volumes:
  neo4j_data:                # Volume persistente para dados Neo4j
```

**Serviços:**

| Serviço | Imagem | Porta | Descrição |
|---------|--------|-------|-----------|
| `api` | Build local | 8000 | Backend FastAPI com hot reload |
| `db` | `neo4j:2025.07.0` | 7474 | Banco de dados Neo4j |

**Comandos:**

```bash
# Subir todos os serviços
docker-compose up --build

# Subir em background
docker-compose up -d --build

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f api
docker-compose logs -f db
```

## Variáveis de Ambiente

### Backend (`.env`)

```env
NEO4J_URI="neo4j://localhost:56789"
NEO4J_AUTH_USER="user"
NEO4J_AUTH_PASSWORD="password"
TMDB_API_TOKEN="seu_token_tmdb_aqui"
FRONTEND_URL="http://localhost:5173"
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEO4J_URI` | Sim | URI de conexão com o Neo4j (protocolo Bolt) |
| `NEO4J_AUTH_USER` | Sim | Usuário do Neo4j |
| `NEO4J_AUTH_PASSWORD` | Sim | Senha do Neo4j |
| `TMDB_API_TOKEN` | Sim | Token Bearer da API do TMDB |
| `FRONTEND_URL` | Não | URL do frontend para CORS (padrão: `http://localhost:5173`) |

### Frontend (`.env`)

```env
VITE_API_ENDPOINT=http://localhost:8000
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_API_ENDPOINT` | Sim | URL base da API backend |

> Variáveis prefixadas com `VITE_` são expostas ao código do frontend pelo Vite.

## Infraestrutura AWS

### Neo4j em EC2

O banco Neo4j pode ser hospedado em uma instância EC2 na AWS. A conexão local é feita via **AWS Systems Manager (SSM) Port Forwarding**.

#### Pré-requisitos

- AWS CLI configurado com credenciais válidas
- Plugin Session Manager instalado
- Instância EC2 com SSM Agent ativo

#### Comando de Port Forwarding

```bash
aws ssm start-session \
    --target i-xxxxxxxxxxx \
    --document-name AWS-StartPortForwardingSession \
    --parameters '{"portNumber":["7687"], "localPortNumber":["56789"]}'
```

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `--target` | `i-xxxxxxxxxxx` | ID da instância EC2 |
| `portNumber` | `7687` | Porta do Neo4j na instância (Bolt) |
| `localPortNumber` | `56789` | Porta local mapeada |

Após executar, o Neo4j estará acessível em `neo4j://localhost:56789`.

## Portas Utilizadas

| Porta | Serviço | Protocolo |
|-------|---------|-----------|
| `5173` | Frontend (Vite dev server) | HTTP |
| `8000` | Backend (FastAPI/Uvicorn) | HTTP |
| `7474` | Neo4j Browser | HTTP |
| `7687` | Neo4j Bolt | Bolt |
| `56789` | Neo4j via SSM (local) | Bolt |

## Diagrama de Deploy

```
┌─────────────────────────────────────────────┐
│              Máquina Local                   │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Frontend │  │ Backend  │  │ Neo4j     │ │
│  │ :5173    │─▶│ :8000    │─▶│ :7474     │ │
│  │ (Vite)   │  │ (FastAPI)│  │ (Docker)  │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│                      │                      │
│                      ▼                      │
│              ┌──────────────┐               │
│              │  TMDB API    │               │
│              │  (externo)   │               │
│              └──────────────┘               │
└─────────────────────────────────────────────┘

         ── OU (Neo4j remoto) ──

┌─────────────────────────────────────────────┐
│              Máquina Local                   │
│                                             │
│  ┌──────────┐  ┌──────────┐                 │
│  │ Frontend │  │ Backend  │                 │
│  │ :5173    │─▶│ :8000    │──┐              │
│  └──────────┘  └──────────┘  │              │
│                              │ SSM Tunnel   │
│                              │ :56789       │
└──────────────────────────────┼──────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  AWS EC2         │
                    │  Neo4j :7687     │
                    └──────────────────┘
```

# 02 — Arquitetura do Sistema

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
│                     http://localhost:5173                        │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────┐  │
│  │   App.tsx      │  │  GraphNode    │  │  ModalEndGame       │  │
│  │  (ReactFlow)   │  │  (Popover)    │  │  ModalHowToPlay     │  │
│  │  Game State    │  │  Node Actions │  │  FuzzyText          │  │
│  └───────┬───────┘  └───────┬───────┘  └─────────────────────┘  │
│          │                  │                                    │
│          └──────────┬───────┘                                    │
│                     │ Axios HTTP                                 │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI + Uvicorn)                    │
│                   http://localhost:8000                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  main.py — FastAPI App + CORS Middleware                  │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │  api/v1/endpoints.py — Route Handlers                     │   │
│  │                                                           │   │
│  │  GET  /atores/random          → Ator aleatório            │   │
│  │  GET  /atores/{name}/novelas  → Novelas de um ator        │   │
│  │  GET  /novelas/{name}/atores  → Atores de uma novela      │   │
│  │  GET  /atores/{name}          → Detalhes do ator (TMDB)   │   │
│  │  GET  /novelas/{name}         → Detalhes da novela (TMDB) │   │
│  │  POST /graph/shortest_path    → Validação do caminho      │   │
│  │  GET  /health                 → Health check              │   │
│  └──────────┬──────────────────────────────┬────────────────┘   │
│             │                              │                    │
│  ┌──────────▼──────────┐    ┌──────────────▼────────────────┐   │
│  │  db/neo4j.py        │    │  api/service.py               │   │
│  │  Neo4jRepository    │    │  TMDBService                  │   │
│  │  (Queries Cypher)   │    │  (API Externa)                │   │
│  └──────────┬──────────┘    └──────────────┬────────────────┘   │
│             │                              │                    │
└─────────────┼──────────────────────────────┼────────────────────┘
              │                              │
              ▼                              ▼
┌──────────────────────┐      ┌──────────────────────────┐
│   Neo4j Database     │      │   TMDB API               │
│   (Banco de Grafos)  │      │   api.themoviedb.org     │
│                      │      │                          │
│  (Ator)─[:atua_em]─▶ │      │  Imagens de atores       │
│        (Novela)      │      │  Posters de novelas      │
└──────────────────────┘      └──────────────────────────┘
```

## Componentes Principais

### Frontend

| Componente | Responsabilidade |
|------------|-----------------|
| `App.tsx` | Componente principal, gerencia estado do jogo e renderiza o ReactFlow |
| `GraphNode.tsx` | Nó interativo do grafo com popover para seleção de conexões |
| `ModalEndGame.tsx` | Modal de vitória exibido quando o caminho é encontrado |
| `ModalHowToPlay.tsx` | Modal com instruções de como jogar |
| `FuzzyText.tsx` | Título animado com efeito de "fuzzy/glitch" via Canvas |
| `NewNode.tsx` | Nó placeholder ("+") para posições iniciais |
| `base-node.tsx` | Componente base reutilizável para estilização de nós |

### Backend

| Módulo | Responsabilidade |
|--------|-----------------|
| `main.py` | Inicialização do FastAPI, CORS e roteamento |
| `endpoints.py` | Handlers das rotas da API v1 |
| `service.py` | Integração com a API do TMDB para busca de imagens |
| `neo4j.py` | Repositório de acesso ao banco Neo4j (queries Cypher) |
| `models.py` | Modelos Pydantic para validação de dados |
| `config.py` | Configurações da aplicação via variáveis de ambiente |

### Dados

| Componente | Responsabilidade |
|------------|-----------------|
| Neo4j | Armazena o grafo de atores, novelas e relacionamentos |
| TMDB API | Fornece imagens de perfil de atores e posters de novelas |
| Scrapy Spider | Coleta dados de elenco do site Memória Globo |
| CSVs (`neo4j/`) | Arquivos de importação para popular o banco Neo4j |

## Fluxo de Dados

### Início de Jogo

```
Frontend                    Backend                     Neo4j          TMDB
   │                           │                          │              │
   │── GET /atores/random ────▶│                          │              │
   │                           │── get_random_atores() ──▶│              │
   │                           │◀── "Nome do Ator" ───────│              │
   │                           │── search_person() ──────────────────────▶│
   │                           │◀── { profile_path } ────────────────────│
   │◀── { name, img } ────────│                          │              │
   │                           │                          │              │
   │── GET /atores/random ────▶│  (repete para 2º ator)  │              │
```

### Adição de Nó

```
Frontend                    Backend                     Neo4j
   │                           │                          │
   │── GET /atores/{n}/novelas▶│                          │
   │                           │── list_novelas_by_ator()▶│
   │                           │◀── [novela1, novela2...] │
   │◀── [{ name }...] ────────│                          │
```

### Verificação de Caminho

```
Frontend                    Backend                     Neo4j
   │                           │                          │
   │── POST /graph/shortest_  ▶│                          │
   │       path                │                          │
   │   { initial_nodes,       │                          │
   │     nodes }               │── find_filter_          │
   │                           │   shortest_path() ──────▶│
   │                           │◀── path, grau ───────────│
   │◀── { nodes, grau, found }│                          │
```

## Decisões de Arquitetura

1. **Neo4j como banco de dados**: Escolhido por ser um banco de grafos nativo, ideal para modelar relações entre atores e novelas e executar queries de caminho mais curto de forma eficiente.

2. **FastAPI**: Framework Python moderno com suporte nativo a async, validação automática via Pydantic e documentação OpenAPI gerada automaticamente.

3. **React Flow**: Biblioteca especializada em visualização e manipulação de grafos interativos, permitindo drag-and-drop, zoom e pan nativamente.

4. **TMDB API**: Utilizada para enriquecer a experiência visual com fotos reais dos atores e posters das novelas, sem necessidade de armazenar imagens localmente.

5. **Separação Frontend/Backend**: Arquitetura desacoplada permite desenvolvimento independente e deploy separado de cada camada.

6. **AWS ECS (Fargate)**: Backend roda em containers gerenciados pelo ECS com Fargate, eliminando a necessidade de gerenciar servidores. A imagem Docker é armazenada no ECR e o API Gateway roteia o tráfego externo para o serviço ECS.

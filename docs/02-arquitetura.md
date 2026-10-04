# 02 — Arquitetura do Sistema

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                        │
│                   http://localhost:5173                          │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────┐  │
│  │   App.tsx      │  │  GameBoard    │  │  ModalEndGame       │  │
│  │  Game State    │  │  (Cytoscape)  │  │  ModalHowToPlay     │  │
│  │                │  │  Popover      │  │  FuzzyText          │  │
│  └───────┬───────┘  └───────┬───────┘  └─────────────────────┘  │
│          │                  │                                    │
│          │        ┌─────────▼─────────────────────────────┐     │
│          │        │  lib/graph.ts                          │     │
│          │        │  Cytoscape HEADLESS (grafo completo)   │     │
│          │        │  getRandomAtor / listNovelasByAtor /   │     │
│          │        │  listAtoresByNovela / aStar(caminho)   │     │
│          │        │  ◀── src/data/graph.json (embarcado)   │     │
│          │        └────────────────────────────────────────┘     │
│          │ Axios HTTP (apenas imagens)                            │
└──────────┼───────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI + Uvicorn) — SÓ-TMDB            │
│                 http://localhost:8000                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  main.py — FastAPI App + CORS + load_dotenv()             │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │  api/v1/endpoints.py — Route Handlers                     │   │
│  │                                                           │   │
│  │  GET  /atores/{name}   → Imagem (perfil) do ator (TMDB)   │   │
│  │  GET  /novelas/{name}  → Imagem (poster) da novela (TMDB) │   │
│  │  GET  /health          → Health check                     │   │
│  └──────────────────────────────┬────────────────────────────┘   │
│                                 │                               │
│                 ┌───────────────▼────────────────┐              │
│                 │  api/service.py — TMDBService   │              │
│                 └───────────────┬────────────────┘              │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  ▼
                      ┌──────────────────────────┐
                      │   TMDB API               │
                      │   api.themoviedb.org     │
                      │   Imagens de atores      │
                      │   Posters de novelas     │
                      └──────────────────────────┘
```

## Componentes Principais

### Frontend

| Componente | Responsabilidade |
|------------|-----------------|
| `App.tsx` | Componente principal; gerencia estado do jogo e orquestra o board |
| `components/GameBoard.tsx` | Board Cytoscape visível; popover de conexões; auto-conexão de arestas; dispara a verificação de caminho |
| `lib/graph.ts` | Camada de grafo local — Cytoscape **headless** com o grafo completo; substitui as consultas que antes iam ao banco |
| `data/graph.json` | Dataset do grafo embarcado (gerado dos CSVs) |
| `components/ModalEndGame.tsx` | Modal de vitória (grau de separação + compartilhamento) |
| `components/ModalHowToPlay.tsx` | Instruções de como jogar |
| `components/FuzzyText.tsx` | Título animado com efeito CRT via Canvas |
| `components/TvStaticBackground.tsx` | Fundo de estática/scanlines |
| `lib/share.ts` | Geração do texto de resultado e Web Share API |

### Backend

| Módulo | Responsabilidade |
|--------|-----------------|
| `main.py` | Inicialização do FastAPI, CORS, carga do `.env` e roteamento |
| `endpoints.py` | Handlers das rotas da API v1 (só-TMDB) + health |
| `service.py` | Integração com a API do TMDB para busca de imagens |
| `models.py` | Modelos Pydantic (`Ator`, `Novela`, `HealthResponse`) |
| `config.py` | Configurações da aplicação via variáveis de ambiente |

### Dados

| Componente | Responsabilidade |
|------------|-----------------|
| `graph.json` | Dataset do grafo (atores, novelas, relações) carregado no Cytoscape headless |
| `scripts/build-graph.py` | Gera o `graph.json` a partir dos CSVs |
| CSVs (`neo4j/`) | **Fonte** do dataset (não há mais banco em runtime) |
| TMDB API | Fornece imagens de perfil de atores e posters de novelas |
| Scrapy Spider | Coleta dados de elenco do site Memória Globo |

## Fluxo de Dados

### Início de Jogo

```
Frontend (lib/graph.ts)              Backend                 TMDB
   │                                    │                      │
   │ getRandomAtor() x2 (local)         │                      │
   │ (sorteio sobre o grafo headless)   │                      │
   │                                    │                      │
   │── GET /atores/{nome}  (imagem) ───▶│                      │
   │                                    │── search_person() ──▶│
   │                                    │◀── { profile_path } ─│
   │◀── { name, img } ──────────────────│                      │
```

### Adição de Nó

```
Frontend                                 (sem rede para o grafo)
   │
   │ listNovelasByAtor(nome)  ← Cytoscape headless (local)
   │ listAtoresByNovela(nome) ← Cytoscape headless (local)
   │
   │── GET /atores|novelas/{nome} ─▶ backend (apenas imagem do novo nó)
```

### Verificação de Caminho

```
Frontend (lib/graph.ts)                  (100% local, sem rede)
   │
   │ findFilterShortestPath(iniciais, jogados)
   │   → subgrafo induzido pelos nós jogados
   │   → cy.aStar({ directed:false })
   │   → { nodes, grau, found }
```

## Decisões de Arquitetura

1. **Grafo no frontend (Cytoscape.js)**: o grafo de atores/novelas é um dataset
   estático embarcado, carregado numa instância **headless** do Cytoscape. É um
   motor de grafos de verdade — expõe `aStar`/`bfs`/`dijkstra` nativos —, então a
   estrutura consultável é a própria instância `cy`. Elimina a dependência de um
   banco em runtime e torna toda a lógica de jogo offline.

2. **Pathfinding por subgrafo induzido**: a verificação do caminho mais curto
   restrito aos nós jogados é feita montando um subgrafo com apenas esses nós e
   rodando `aStar` não-dirigido — qualquer caminho encontrado já respeita a
   restrição por construção.

3. **FastAPI**: framework Python moderno com async, validação Pydantic e OpenAPI
   automático.

4. **Backend só-TMDB**: o único papel do backend é ser proxy das imagens do TMDB
   (protege o `TMDB_API_TOKEN`, que não pode ir para o browser) e enriquecer a
   UI com fotos de atores e posters de novelas.

5. **Separação Frontend/Backend**: arquitetura desacoplada permite desenvolvimento
   e deploy independentes.

6. **AWS ECS (Fargate)**: backend roda em containers no ECS/Fargate; imagem no
   ECR; API Gateway roteia o tráfego externo. O frontend é estático e pode ser
   servido por qualquer CDN/host estático.

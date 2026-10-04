# Conecte os Globais

Um jogo interativo que desafia os jogadores a conectar dois atores através de suas participações em novelas, utilizando visualização de grafos interativa.

## 🎯 Sobre o Projeto

O "Conecte os Globais" é inspirado no conceito dos "Seis Graus de Separação", onde os jogadores devem encontrar conexões entre atores através das novelas que participaram. O jogo utiliza uma interface visual com grafos interativos, permitindo que o usuário construa o caminho entre dois atores selecionados aleatoriamente.

## 🏗️ Arquitetura

O grafo de atores, novelas e relações vive **inteiramente no frontend**:
renderizado e consultado pelo **Cytoscape.js**. O backend existe apenas como um
proxy de imagens do **TMDB** — não há banco de dados em runtime.

```
┌───────────────────────────────────────────────┐
│  Frontend (React + Vite + Cytoscape.js)        │
│                                                │
│  • Board visível: cytoscape() renderiza nós    │
│    (atores/novelas) e arestas                  │
│  • "Banco" de grafo: cytoscape() HEADLESS em    │
│    memória, carregado de graph.json            │
│  • Pathfinding: cy.aStar()/bfs() no navegador  │
│                                                │
│         │ Axios (apenas imagens)               │
└─────────┼──────────────────────────────────────┘
          ▼
┌───────────────────────────────────────────────┐
│  Backend (FastAPI) — SÓ-TMDB                   │
│  GET /atores/{name}   → imagem de perfil        │
│  GET /novelas/{name}  → poster da novela        │
│  GET /health                                   │
│         │                                       │
│         ▼  TMDB API (api.themoviedb.org)        │
└───────────────────────────────────────────────┘
```

Detalhes em [`docs/02-arquitetura.md`](./docs/02-arquitetura.md) e
[`frontend/README.md`](./frontend/README.md).

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Cytoscape.js** — renderização do grafo **e** motor de pathfinding (`aStar`/`bfs`) no próprio navegador
- **Radix UI** + **Tailwind CSS** — interface
- **Axios** — HTTP, apenas para buscar imagens no backend (TMDB)
- Dataset do grafo embarcado como `graph.json` (gerado dos CSVs)

### Backend
- **FastAPI** + **Uvicorn** — framework web / ASGI
- **Python 3.11+** + **Pydantic** — validação
- **HTTPX** — cliente HTTP para a API do TMDB

## 📁 Estrutura do Projeto

```
conecte-os-globais/
├── frontend/
│   ├── scripts/
│   │   └── build-graph.py        # CSVs -> src/data/graph.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameBoard.tsx      # Board Cytoscape + popover de conexões
│   │   │   ├── ModalEndGame.tsx   # Modal de vitória
│   │   │   ├── ModalHowToPlay.tsx # Instruções
│   │   │   ├── FuzzyText.tsx      # Título com efeito CRT
│   │   │   └── TvStaticBackground.tsx
│   │   ├── config/
│   │   │   └── env.ts            # Configurações de ambiente
│   │   ├── data/
│   │   │   └── graph.json        # Dataset do grafo (gerado)
│   │   ├── lib/
│   │   │   ├── graph.ts          # Camada de grafo (Cytoscape headless)
│   │   │   └── share.ts          # Compartilhamento do resultado
│   │   ├── App.tsx               # Componente principal
│   │   └── main.tsx              # Ponto de entrada
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── service.py        # Integração TMDB
│   │   │   └── v1/
│   │   │       ├── endpoints.py  # Rotas (só-TMDB) + health
│   │   │       └── api.py        # Configuração das rotas
│   │   ├── core/
│   │   │   └── config.py         # Configurações do backend
│   │   ├── models.py             # Modelos Pydantic
│   │   └── main.py               # Aplicação FastAPI
│   ├── tests/                    # Testes automatizados
│   ├── requirements.txt
│   └── docker-compose.yml
└── neo4j/                        # CSVs: FONTE do dataset do grafo
    ├── atores_nodes.csv
    ├── novelas_nodes.csv
    └── relationships.csv
```

## 🛠️ Como Executar

### Pré-requisitos

- **Node.js 20+** e npm/yarn
- **Python 3.11+** e pip
- **TMDB_API_TOKEN** (para as imagens)

### Desenvolvimento Local

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # edite com seu TMDB_API_TOKEN
uvicorn app.main:app --reload     # http://localhost:8000
```

#### Frontend

```bash
cd frontend
npm install
npm run build:graph               # gera src/data/graph.json a partir dos CSVs (se mudaram)
# crie um .env com: VITE_API_ENDPOINT=http://localhost:8000
npm run dev                       # http://localhost:5173
```

> O frontend precisa do backend no ar **apenas** para as imagens (TMDB). Toda a
> lógica de grafo (sorteio, conexões, caminho) funciona offline.

#### Com Docker

```bash
docker-compose up --build         # backend em http://localhost:8000
```

## 🎮 Como Jogar

1. **Iniciar Jogo**: Clique em "Novo jogo" para sortear dois atores aleatórios.
2. **Adicionar Conexões**: Clique num nó para ver suas novelas/atores e adicione os que conectam o caminho.
3. **Completar Caminho**: Continue adicionando nós até conectar os dois atores iniciais.
4. **Verificar Resultado**: O caminho é verificado automaticamente a cada nó adicionado (no navegador).
5. **Vitória**: Um modal aparece quando a conexão é encontrada, com o grau de separação e opção de compartilhar.

## 📡 API Endpoints

Backend **só-TMDB** (imagens):

- `GET /api/v1/atores/{name}` — imagem (perfil) de um ator
- `GET /api/v1/novelas/{name}` — imagem (poster) de uma novela
- `GET /api/v1/health` — status da API

## 🗄️ Dados do Grafo

Não há banco de dados em runtime. O grafo (atores, novelas e relações) é um
**dataset estático** gerado a partir dos 3 CSVs em `neo4j/`
(`atores_nodes.csv`, `novelas_nodes.csv`, `relationships.csv`) e embarcado no
frontend como `frontend/src/data/graph.json`
(**7.700 atores · 303 novelas · 20.658 relações**).

No boot, o app carrega esse JSON numa instância **headless** do Cytoscape, que
atua como o índice de grafo consultável (`aStar`, `bfs`, `dijkstra`). O board
visível recebe apenas os nós que o jogador adiciona.

```bash
cd frontend
npm run build:graph   # python3 scripts/build-graph.py -> src/data/graph.json
```

> A pasta `neo4j/` mantém só os **CSVs de origem** do dataset — não há mais um
> banco Neo4j em uso.

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
TMDB_API_TOKEN="token"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGINS="https://conecteosglobais.igormarcelo.dev.br"
```

#### Frontend (.env)
```env
VITE_API_ENDPOINT=http://localhost:8000
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎯 Funcionalidades Futuras

- [ ] Sistema de pontuação baseado no número de conexões
- [ ] Modo multiplayer
- [ ] Diferentes categorias (filmes, séries, etc.)
- [ ] Sistema de dicas
- [ ] Histórico de jogadas
- [ ] Interface mobile otimizada

---

**🎭 Conecte os Globais** — Descubra as conexões do mundo artístico!

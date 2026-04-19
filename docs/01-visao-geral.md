# 01 — Visão Geral do Projeto

## O que é o Conecte os Globais?

O **Conecte os Globais** é um jogo interativo inspirado no conceito dos **Seis Graus de Separação**. O jogador recebe dois atores brasileiros selecionados aleatoriamente e deve encontrar um caminho de conexão entre eles, alternando entre novelas e atores que participaram dessas novelas.

O jogo utiliza uma interface visual com **grafos interativos**, onde cada nó representa um ator ou uma novela, e as arestas representam participações.

## Conceito do Jogo

```
Ator A ──participou──▶ Novela X ◀──participou── Ator B ──participou──▶ Novela Y ◀──participou── Ator C
```

O jogador precisa construir esse caminho manualmente, escolhendo novelas e atores a cada passo, até que os dois atores iniciais estejam conectados.

## Fluxo do Jogo

1. O jogador clica em **"Novo Jogo"**
2. Dois atores aleatórios são sorteados e exibidos como nós no grafo
3. O jogador clica em um ator para ver as novelas em que ele participou
4. Ao selecionar uma novela, ela é adicionada ao grafo como um novo nó
5. O jogador clica na novela para ver os atores que participaram dela
6. O processo se repete até que os dois atores iniciais estejam conectados
7. A cada adição de nó, o sistema verifica automaticamente se existe um caminho válido
8. Quando o caminho é encontrado, um modal de vitória é exibido com o grau de separação

## Objetivos Técnicos

- Demonstrar o uso de **banco de dados de grafos** (Neo4j) para modelar relações entre entidades
- Criar uma interface interativa com **visualização de grafos** usando React Flow
- Integrar com a **API do TMDB** para enriquecer os dados com imagens de atores e novelas
- Coletar dados reais do site **Memória Globo** usando web scraping com Scrapy
- Oferecer uma experiência de jogo fluida com verificação automática de caminhos

## Público-Alvo

Fãs de novelas brasileiras e entusiastas de jogos de trivia/conexão que queiram testar seus conhecimentos sobre o elenco das novelas da Globo.

## Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Flow, Radix UI, Tailwind CSS |
| **Backend** | Python 3.11+, FastAPI, Pydantic, Uvicorn |
| **Banco de Dados** | Neo4j (grafo) |
| **Web Scraping** | Scrapy |
| **API Externa** | TMDB (imagens de atores e novelas) |
| **Deploy** | Docker, AWS ECS (Fargate) |

## Testes

O projeto possui suítes de testes automatizados tanto no backend quanto no frontend.

### Backend — pytest

- **Framework:** pytest com FastAPI `TestClient`
- **Localização:** `backend/tests/`
- **Total:** 46 testes em 8 arquivos

| Arquivo | Cobertura |
|---|---|
| `test_health.py` | Endpoint de health check |
| `test_main.py` | Inicialização da aplicação FastAPI |
| `test_config.py` | Configurações e variáveis de ambiente |
| `test_models.py` | Modelos Pydantic |
| `test_atores.py` | Endpoints de atores |
| `test_novelas.py` | Endpoints de novelas |
| `test_graph.py` | Busca de caminho mais curto no grafo |
| `test_tmdb_service.py` | Integração com a API do TMDB |

**Como executar:**

```bash
cd backend

# Executar todos os testes
pytest -v

# Executar um arquivo específico
pytest tests/test_atores.py -v

# Executar com cobertura (requer pytest-cov)
pytest --cov=app -v
```

### Frontend — Vitest

- **Framework:** Vitest + React Testing Library + jsdom
- **Localização:** `frontend/src/tests/`
- **Total:** 65 testes em 11 arquivos

| Arquivo | Cobertura |
|---|---|
| `App.test.tsx` | Renderização do app, fluxo de novo jogo, chamadas à API, tratamento de erros |
| `components/GraphNode.test.tsx` | Nó de ator/novela, avatar, cores de borda |
| `components/ModalEndGame.test.tsx` | Modal de vitória, estados aberto/fechado, callback |
| `components/ModalHowToPlay.test.tsx` | Modal de instruções, abertura/fechamento, conteúdo |
| `components/FuzzyText.test.tsx` | Renderização do canvas, props customizadas |
| `components/TvStaticBackground.test.tsx` | Canvas de estática de TV, estilos inline |
| `components/NewNode.test.tsx` | Nó placeholder "+", borda tracejada |
| `components/base-node.test.tsx` | Todos os sub-componentes (BaseNode, Header, Title, Content, Footer) |
| `components/placeholder-node.test.tsx` | Integração com BaseNode, children |
| `config/env.test.ts` | Exportação e valores do env |
| `lib/utils.test.ts` | Utilitário `cn()` — merge, dedup, condicionais |

**Como executar:**

```bash
cd frontend

# Executar todos os testes
npm run test

# Executar em modo watch (desenvolvimento)
npm run test:watch

# Executar com cobertura
npm run test:coverage

# Executar um arquivo específico
npx vitest --run src/tests/components/GraphNode.test.tsx
```

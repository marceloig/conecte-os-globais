# frontend

Frontend do **Conecte os Globais**: **Cytoscape.js** renderiza o grafo e também
é o motor de consultas — toda a lógica de grafo roda no navegador, sem Neo4j. O
backend é usado apenas como proxy de imagens do TMDB.

## Arquitetura

| Camada | Como funciona |
|---|---|
| Render | `cytoscape` (board visível) desenha nós (atores/novelas) e arestas |
| "Banco" de grafo | `cytoscape` **headless** em memória, carregado de `src/data/graph.json` |
| Pathfinding | `cy.aStar({ directed:false })` sobre o subgrafo induzido pelos nós jogados |
| random / conexões | `src/lib/graph.ts` (local, no navegador) |
| Imagens | backend TMDB (`GET /atores/{name}`, `GET /novelas/{name}`) |

## Armazenamento no frontend — escolha

Dataset estático `src/data/graph.json` (gerado dos CSVs em `../neo4j/`), carregado
num Cytoscape **headless** no boot. Esse `cy` headless **é** o "banco" consultável:
expõe `aStar`/`bfs`/`dijkstra` nativos.

- **localStorage** descartado: ~5 MB e API síncrona; 20k+ arestas estouram o teto.
- **IndexedDB puro** descartado como fonte: não traz travessia de grafo pronta.
  Entra apenas como cache best-effort (`cacheGraphElements`).

## Gerar o dataset

```bash
npm run build:graph   # python3 scripts/build-graph.py -> src/data/graph.json
```

Lê `../neo4j/{atores_nodes,novelas_nodes,relationships}.csv`. Só stdlib do Python.
Saída atual: **7.700 atores · 303 novelas · 20.658 relações**.

## Rodar

```bash
npm install
npm run build:graph   # se os CSVs mudaram
npm run dev           # http://localhost:5173
npm test              # vitest (inclui testes de graph.ts)
npm run build         # typecheck + build de produção
```

Precisa do backend rodando (`../backend`) só para as **imagens TMDB** —
o jogo funciona offline para toda a lógica de grafo.

## Regras do jogo

Novo jogo → 2 atores aleatórios → clicar nó → listar conexões → adicionar →
verificação de caminho automática → modal de vitória com grau e compartilhamento.

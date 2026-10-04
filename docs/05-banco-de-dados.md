# 05 — Dados do Grafo

O grafo de atores, novelas e relações **não vive num banco em runtime**. Ele é um
dataset estático embarcado no frontend e consultado por uma instância **headless**
do Cytoscape.js.

## Por que o grafo no frontend (Cytoscape)?

- O domínio é naturalmente um grafo (atores conectados a novelas).
- A operação central do jogo é encontrar o **caminho mais curto** entre dois nós.
- O Cytoscape.js é um motor de grafos de verdade: expõe `aStar`, `bfs` e
  `dijkstra` nativos — a mesma capacidade que antes exigia um banco de grafos.
- Com o dataset embarcado, toda a lógica do jogo roda offline; o backend só serve
  imagens.

## Pipeline de dados

```
Scrapy (Memória Globo)  ─▶  CSVs em neo4j/  ─▶  scripts/build-graph.py  ─▶  src/data/graph.json  ─▶  Cytoscape headless
```

Os CSVs em `neo4j/` são a **fonte** do dataset (o nome da pasta é histórico). O
script `frontend/scripts/build-graph.py` os converte no `graph.json` embarcado.

```bash
cd frontend
npm run build:graph   # python3 scripts/build-graph.py -> src/data/graph.json
```

Saída atual: **7.700 atores · 303 novelas · 20.658 relações**.

## Formato do dataset (`graph.json`)

Formato de *elements* do Cytoscape:

```json
{
  "nodes": [
    { "data": { "id": "Afrânio Gama", "label": "Afrânio Gama", "type": "ator" } },
    { "data": { "id": "Cabocla - 2ª versão", "label": "Cabocla - 2ª versão", "type": "novela" } }
  ],
  "edges": [
    { "data": { "id": "Aisha Jambo__Cabocla - 2ª versão",
                "source": "Aisha Jambo", "target": "Cabocla - 2ª versão",
                "personagem": "Ritinha" } }
  ]
}
```

- `id` do nó = o `name` legível (o jogo identifica nós pelo nome).
- `type` ∈ `{ "ator", "novela" }`.
- A aresta `atua_em` é tratada como **não-direcionada** no pathfinding.

## Arquivos de origem (CSV)

### `atores_nodes.csv`

```csv
~id,~label,name
"ator_Afrnio_Gama","Ator","Afrânio Gama"
"ator_Aisha_Jambo","Ator","Aisha Jambo"
```

| Coluna | Descrição |
|--------|-----------|
| `~id` | Identificador único de origem (`ator_Nome_Sobrenome`) |
| `~label` | `Ator` |
| `name` | Nome completo — vira o `id`/`label` do nó no `graph.json` |

### `novelas_nodes.csv`

```csv
~id,~label,name
"novela_Cabocla__2_verso","Novela","Cabocla - 2ª versão"
"novela_Cama_de_Gato","Novela","Cama de Gato"
```

### `relationships.csv`

```csv
~id,~from,~to,~label,personagem
"ator_Aisha_Jambo_acted_in_novela_Cabocla__2_verso","ator_Aisha_Jambo","novela_Cabocla__2_verso","ACTED_IN","Ritinha"
```

| Coluna | Descrição |
|--------|-----------|
| `~from` / `~to` | IDs de origem (resolvidos para `name` no `graph.json`) |
| `~label` | `ACTED_IN` |
| `personagem` | Nome do personagem (opcional) |

## Consultas no frontend (`src/lib/graph.ts`)

A instância headless (`cytoscape({ headless: true, elements })`) é o "banco". A
camada `graph.ts` expõe:

| Função | Equivalente | Como |
|--------|-------------|------|
| `getRandomAtor()` | ator aleatório | sorteio sobre `nodes('[type="ator"]')` |
| `listNovelasByAtor(name)` | novelas de um ator | `node.neighborhood('node[type="novela"]')`, ordenado |
| `listAtoresByNovela(name)` | atores de uma novela | `node.neighborhood('node[type="ator"]')`, ordenado |
| `findFilterShortestPath(iniciais, jogados)` | caminho mais curto filtrado | subgrafo induzido pelos nós jogados + `cy.aStar({ directed:false })` |

### Caminho mais curto filtrado

A regra do jogo — "existe caminho mais curto entre os 2 atores iniciais usando
apenas nós que o jogador adicionou?" — é resolvida **por construção**: monta-se um
subgrafo contendo apenas os nós jogados (e os 2 iniciais) e suas arestas, e roda-se
`aStar` não-dirigido nesse subgrafo. Qualquer caminho encontrado já respeita a
restrição, sem precisar de um filtro explícito. O **grau de separação** é o número
de arestas do caminho (`nós − 1`).

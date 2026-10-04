# 04 — Frontend (React + TypeScript)

O frontend renderiza o grafo com **Cytoscape.js** e também resolve toda a lógica
de grafo (sorteio, conexões, caminho mais curto) **no navegador**, a partir de um
dataset embarcado. O backend é usado apenas para imagens (TMDB).

## Estrutura de Diretórios

```
frontend/
├── scripts/
│   └── build-graph.py              # CSVs (../neo4j) -> src/data/graph.json
├── src/
│   ├── App.tsx                     # Componente principal do jogo
│   ├── App.css                     # Estilos do App
│   ├── main.tsx                    # Ponto de entrada (React DOM)
│   ├── index.css                   # Estilos globais + efeito TV
│   ├── vite-env.d.ts               # Tipos do Vite
│   ├── components/
│   │   ├── GameBoard.tsx           # Board Cytoscape + popover de conexões
│   │   ├── ModalEndGame.tsx        # Modal de vitória
│   │   ├── ModalHowToPlay.tsx      # Modal de instruções
│   │   ├── FuzzyText.tsx           # Texto animado (Canvas)
│   │   └── TvStaticBackground.tsx  # Fundo de estática de TV
│   ├── config/
│   │   └── env.ts                  # Exporta variáveis de ambiente
│   ├── data/
│   │   └── graph.json              # Dataset do grafo (gerado)
│   ├── lib/
│   │   ├── graph.ts                # Camada de grafo (Cytoscape headless)
│   │   ├── share.ts                # Compartilhamento do resultado
│   │   └── utils.ts                # Utilitário cn() (clsx + twMerge)
│   └── tests/                      # Vitest (graph, share, utils)
├── public/
├── package.json
├── vite.config.ts                  # Configuração Vite + alias @/
├── tsconfig.json
└── eslint.config.js
```

## Ponto de Entrada (`main.tsx`)

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme appearance="dark">
      <App />
    </Theme>
  </StrictMode>,
)
```

## Camada de Grafo (`lib/graph.ts`)

O coração da aplicação. Carrega `src/data/graph.json` numa instância **headless**
do Cytoscape (`cytoscape({ headless: true, elements })`) — essa instância é o
"banco" de grafo consultável. Expõe:

| Função | Descrição |
|--------|-----------|
| `getRandomAtor()` | Sorteia um ator (sobre `nodes('[type="ator"]')`) |
| `listNovelasByAtor(name)` | Novelas vizinhas de um ator, ordenadas e únicas |
| `listAtoresByNovela(name)` | Atores vizinhos de uma novela, ordenados e únicos |
| `findFilterShortestPath(iniciais, jogados)` | Caminho mais curto entre os 2 iniciais, restrito aos nós jogados, via `cy.aStar({ directed:false })` sobre o subgrafo induzido |

Detalhes do dataset e da equivalência de pathfinding em
[05 - Dados do Grafo](./05-banco-de-dados.md).

## Componente Principal (`App.tsx`)

### Estado

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `result` | `ShortestPathResult \| null` | Resultado do pathfinding (nós, grau, found) |
| `openDialog` | `boolean` | Visibilidade do modal de vitória |
| `isLoadingNewGame` | `boolean` | Carregamento do novo jogo |

### Função `newGame()`

1. Sorteia **localmente** dois atores distintos com `getRandomAtor()`.
2. Busca a **imagem** de cada um no backend (`GET /api/v1/atores/{name}`).
3. Semeia o board (`boardRef.current.reset(left, right)`).

### Board e verificação

O `<GameBoard>` expõe uma API imperativa (`ref`): `reset(left, right)` semeia os 2
atores iniciais; a verificação do caminho roda **dentro** do board a cada nó
adicionado e sobe pelo callback `onWin(result)`.

## Componentes

### `GameBoard.tsx`

Board do jogo em Cytoscape (substitui o antigo `<ReactFlow>`).

**Responsabilidades:**
- Monta um `cytoscape()` visível; estilos por **seletor de tipo**
  (`node[type="ator"]`/`node[type="novela"]`) para cor de borda e badge;
  a imagem TMDB entra via o seletor `node[img]` (só quando há URL).
- Ao **clicar** num nó, abre um `Popover` (Radix) com as conexões daquele nó,
  consultadas **localmente** por `listNovelasByAtor` / `listAtoresByNovela`.
- Ao **adicionar** um nó: busca a imagem no backend (TMDB), insere o nó e
  **auto-conecta** arestas para todos os nós já no board que sejam vizinhos no
  grafo completo; reposiciona com layout `cose`.
- Dispara `findFilterShortestPath` sempre que há ≥ 3 nós (gatilho equivalente ao
  antigo `onNodesChange`).

### `ModalEndGame.tsx`

Modal de vitória. Recebe o `ShortestPathResult` direto (sem `useReactFlow`),
monta o texto do caminho (`A ➔ Novela ➔ B`) e oferece o compartilhamento
(`lib/share.ts`, preservado).

### `ModalHowToPlay.tsx`

Instruções do jogo (objetivo, interação, desafio do caminho mais curto).

### `FuzzyText.tsx`

Título animado via Canvas com efeito "fuzzy/glitch".

| Prop | Default | Descrição |
|------|---------|-----------|
| `baseIntensity` | `0.18` | Intensidade base |
| `hoverIntensity` | `0.5` | Intensidade no hover |
| `enableHover` | `true` | Habilita o efeito no hover |
| `fontSize` | `clamp(2rem, 8vw, 8rem)` | Tamanho da fonte |

### `TvStaticBackground.tsx`

Canvas de estática de TV (ruído cinza ~20 fps), compondo o visual CRT com os
`scanlines`/vinheta do `index.css`.

## Dependências Principais

| Pacote | Uso |
|--------|-----|
| `react` | Biblioteca UI |
| `cytoscape` | Renderização do grafo + pathfinding (`aStar`/`bfs`) |
| `@types/cytoscape` | Tipos |
| `@radix-ui/themes` | Sistema de design (componentes UI) |
| `axios` | Cliente HTTP (apenas imagens TMDB) |
| `tailwindcss` | CSS utilitário |
| `vite` | Build tool e dev server |
| `typescript` | Tipagem estática |
| `clsx` + `tailwind-merge` | Utilitário `cn()` |

## Configuração

### Vite (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})
```

### Scripts (`package.json`)

| Script | Ação |
|--------|------|
| `npm run build:graph` | Gera `src/data/graph.json` a partir dos CSVs |
| `npm run dev` | Dev server (http://localhost:5173) |
| `npm run build` | Typecheck (`tsc -b`) + build de produção |
| `npm test` | Vitest |

### Variáveis de Ambiente

```env
VITE_API_ENDPOINT=http://localhost:8000
```

Acessada via `import.meta.env.VITE_API_ENDPOINT` (exportada em `config/env.ts`).

> Em desenvolvimento, rode o dev server numa origem permitida pelo CORS do
> backend — `http://localhost:5173` (valor padrão de `FRONTEND_URL`).

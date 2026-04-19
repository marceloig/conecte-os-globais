# 04 — Frontend (React + TypeScript)

## Estrutura de Diretórios

```
frontend/
├── src/
│   ├── App.tsx                     # Componente principal do jogo
│   ├── App.css                     # Estilos do App
│   ├── main.tsx                    # Ponto de entrada (React DOM)
│   ├── index.css                   # Estilos globais + efeito TV
│   ├── vite-env.d.ts               # Tipos do Vite
│   ├── components/
│   │   ├── GraphNode.tsx           # Nó interativo do grafo
│   │   ├── ModalEndGame.tsx        # Modal de vitória
│   │   ├── ModalHowToPlay.tsx      # Modal de instruções
│   │   ├── FuzzyText.tsx           # Texto animado (Canvas)
│   │   ├── NewNode.tsx             # Nó placeholder "+"
│   │   ├── base-node.tsx           # Componente base para nós
│   │   ├── placeholder-node.tsx    # Nó placeholder alternativo
│   │   └── ui/                     # Componentes shadcn/ui
│   ├── config/
│   │   └── env.ts                  # Exporta variáveis de ambiente
│   ├── lib/
│   │   └── utils.ts                # Utilitário cn() (clsx + twMerge)
│   ├── hooks/                      # Custom hooks (vazio)
│   └── types/                      # Tipos TypeScript (vazio)
├── public/
│   ├── grade-globo.png             # Imagem da grade Globo
│   └── vite.svg                    # Ícone Vite
├── package.json
├── vite.config.ts                  # Configuração Vite + alias @/
├── tsconfig.json                   # Configuração TypeScript
├── components.json                 # Configuração shadcn/ui
└── eslint.config.js                # Configuração ESLint
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

- Renderiza em modo estrito do React
- Envolve a aplicação com `Theme` do Radix UI no modo escuro

## Componente Principal (`App.tsx`)

### Estado

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `nodes` | `Node[]` | Nós do ReactFlow (atores e novelas) |
| `edges` | `Edge[]` | Arestas do ReactFlow (conexões) |
| `openDialog` | `boolean` | Controla visibilidade do modal de vitória |
| `graph` | `object` | Resultado do shortest path |
| `isLoadingNewGame` | `boolean` | Estado de carregamento do novo jogo |

### Estado Inicial

O jogo começa com dois nós placeholder (tipo `newNode`) posicionados à esquerda e à direita:

```tsx
const initialNodes: Node[] = [
  { id: "0", data: { direction: 'left' },  position: { x: -150, y: 0 }, type: "newNode" },
  { id: "1", data: { direction: 'right' }, position: { x: 150, y: 0 },  type: "newNode" },
];
```

### Tipos de Nó Registrados

```tsx
const nodeTypes = {
  graphNode: GraphNode,      // Nó interativo (ator/novela)
  newNode: PlaceholderNode,  // Nó placeholder "+"
};
```

### Função `newGame()`

1. Faz duas chamadas `GET /api/v1/atores/random`
2. Cria dois nós do tipo `graphNode` com os dados dos atores
3. Posiciona um à esquerda e outro à direita

### Função `onNodesChange()`

Disparada a cada mudança nos nós. Quando há mais de 2 nós e a mudança é do tipo `dimensions`:

1. Filtra apenas nós do tipo `graphNode`
2. Monta lista de `GraphNode` com tipo e nome
3. Envia `POST /graph/shortest_path` com os nós iniciais e todos os nós
4. Se `found === true`, abre o modal de vitória

### Layout

```
┌─────────────────────────────────────┐
│  [FuzzyText: "Conecte os Globais"]  │
├─────────────────────────────────────┤
│  [Como Jogar]    [Novo Jogo]        │  ← Panels
│                                     │
│         ┌─────┐     ┌─────┐         │
│         │Ator │─────│Ator │         │  ← ReactFlow Canvas
│         │  A  │     │  B  │         │
│         └─────┘     └─────┘         │
│                                     │
│  [Controls: zoom, fit, lock]        │
│  [Background: TV static effect]     │
└─────────────────────────────────────┘
```

## Componentes

### `GraphNode.tsx`

Componente mais complexo do frontend. Representa um nó interativo no grafo.

**Funcionalidades:**
- Exibe avatar (imagem TMDB), badge colorido (azul para ator, laranja para novela)
- Ao clicar, abre um `Popover` com lista de conexões disponíveis
- Campo de filtro para buscar na lista
- Botão "+" para adicionar novo nó ao grafo
- Auto-conecta nós relacionados com arestas ao ser montado
- Reposiciona automaticamente para evitar sobreposição

**Fluxo ao montar (useEffect):**
1. Determina URL da API baseado no tipo do nó (ator → busca novelas, novela → busca atores)
2. Faz `GET` para obter lista de conexões
3. Verifica quais conexões já existem no grafo e cria arestas para elas
4. Filtra conexões já presentes para não duplicar na lista do popover
5. Ajusta posição se houver sobreposição com outros nós

**Fluxo ao adicionar nó (`addNewGraphNode`):**
1. Busca detalhes (imagem) via API
2. Cria novo nó posicionado abaixo do nó atual
3. Adiciona ao ReactFlow via `addNodes()`

### `ModalEndGame.tsx`

Modal exibido quando o jogador completa o caminho.

**Funcionalidades:**
- Exibe mensagem de parabéns com emoji 🏆
- Mostra o caminho encontrado (Ator → Novela → Ator → ...)
- Anima as arestas do caminho vencedor (`animated: true`)
- Botão para fechar

### `ModalHowToPlay.tsx`

Modal com instruções do jogo.

**Conteúdo:**
- Explicação do objetivo (conectar dois atores via novelas)
- Instruções de interação (clicar em "Novo Jogo", selecionar conexões)
- Desafio de encontrar o caminho mais curto

### `FuzzyText.tsx`

Componente de texto animado renderizado via Canvas HTML5.

**Funcionalidades:**
- Renderiza texto com efeito de "fuzzy/glitch" (deslocamento horizontal aleatório por linha)
- Intensidade base configurável (`baseIntensity`)
- Intensidade aumentada no hover (`hoverIntensity`)
- Detecção precisa de hover sobre a área do texto
- Suporte a touch events
- Cleanup automático de event listeners e animation frames

**Props:**

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `children` | `ReactNode` | — | Texto a renderizar |
| `fontSize` | `number \| string` | `"clamp(2rem, 8vw, 8rem)"` | Tamanho da fonte |
| `fontWeight` | `string \| number` | `900` | Peso da fonte |
| `color` | `string` | `"#fff"` | Cor do texto |
| `enableHover` | `boolean` | `true` | Habilita efeito hover |
| `baseIntensity` | `number` | `0.18` | Intensidade base do efeito |
| `hoverIntensity` | `number` | `0.5` | Intensidade no hover |

### `NewNode.tsx` / `PlaceholderNode`

Nó placeholder com borda tracejada e símbolo "+". Usado como posição inicial antes do jogo começar.

### `base-node.tsx`

Componente base reutilizável para estilização de nós do ReactFlow. Fornece:
- `BaseNode` — Container com borda, fundo e estilo de seleção
- `BaseNodeHeader` — Layout de cabeçalho
- `BaseNodeHeaderTitle` — Título não-selecionável
- `BaseNodeContent` — Área de conteúdo
- `BaseNodeFooter` — Rodapé com borda superior

## Estilização

### Efeito TV (`index.css`)

O fundo do jogo simula uma tela de TV antiga com barras de cores SMPTE:

- **Barras coloridas**: Gradiente linear com as 7 cores padrão (branco, amarelo, ciano, verde, magenta, vermelho, azul)
- **Linhas RGB**: Pseudo-elemento `::before` com linhas verticais R, G e B sobrepostas
- **Animações**: Estática colorida (`tv-color-static`), mudança de matiz (`tv-color-shift`), deslocamento RGB (`tv-rgb-shift`)
- **Variantes**: `.subtle` (menos distração), `.intense` (mais dramático), `.bars-only` (sem estática), `.static` (sem animação)

No jogo, é usada a combinação `bars-only static` para um fundo temático sem distração.

## Dependências Principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| `react` | 19.1.1 | Biblioteca UI |
| `@xyflow/react` | 12.8.3 | Visualização de grafos interativos |
| `@radix-ui/themes` | 3.2.1 | Sistema de design (componentes UI) |
| `axios` | 1.11.0 | Cliente HTTP |
| `tailwindcss` | 4.1.11 | Framework CSS utilitário |
| `vite` | 7.1.2 | Build tool e dev server |
| `typescript` | 5.8.3 | Tipagem estática |
| `clsx` + `tailwind-merge` | — | Utilitário `cn()` para classes CSS |
| `zod` | 4.0.17 | Validação de schemas |
| `d3-force` | 3.0.0 | Simulação de forças (layout de grafos) |
| `lucide-react` | 0.539.0 | Ícones |

## Configuração

### Vite (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

- Plugin React para JSX/TSX
- Plugin Tailwind CSS v4
- Alias `@/` aponta para `./src/`

### shadcn/ui (`components.json`)

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

### Variáveis de Ambiente

```env
VITE_API_ENDPOINT=http://localhost:8000
```

Acessada via `import.meta.env.VITE_API_ENDPOINT` (exportada em `config/env.ts`).

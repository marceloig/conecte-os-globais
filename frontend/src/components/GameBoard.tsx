/**
 * GameBoard.tsx — tabuleiro do jogo renderizado com Cytoscape.js (substitui <ReactFlow>).
 *
 * Responsabilidades (equivalentes ao antigo ReactFlow + GraphNode):
 *  - Renderiza os nós jogados (atores/novelas) como círculos com avatar TMDB + rótulo.
 *  - Ao clicar num nó, abre um popover (Radix) listando as conexões daquele nó,
 *    consultadas LOCALMENTE via src/lib/graph.ts (antes era GET no backend/Neo4j).
 *  - Ao adicionar um nó, busca a imagem no backend (TMDB — preservado) e auto-conecta
 *    arestas para quaisquer nós já no tabuleiro que sejam vizinhos no grafo completo.
 *  - Dispara a verificação de caminho (findFilterShortestPath, local) sempre que há
 *    >= 3 nós, exatamente como o antigo gatilho em onNodesChange.
 *
 * As imagens continuam vindo do backend TMDB; apenas a lógica de GRAFO saiu do Neo4j.
 */
import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import cytoscape, { type Core, type NodeSingular } from "cytoscape";
import { Box, Flex, Button, Popover, Table, ScrollArea, TextField } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { env } from "@/config/env";
import {
  listNovelasByAtor,
  listAtoresByNovela,
  findFilterShortestPath,
  type NodeType,
  type ShortestPathResult,
} from "@/lib/graph";

export interface PlayedBoardNode {
  name: string;
  type: NodeType;
  img?: string;
  direction: "left" | "right";
}

export interface GameBoardHandle {
  /** limpa o tabuleiro e semeia os 2 atores iniciais */
  reset: (left: PlayedBoardNode, right: PlayedBoardNode) => void;
  /** retorna o resultado do caminho atual (para animar no modal) */
  getPath: () => ShortestPathResult | null;
}

interface GameBoardProps {
  onWin: (result: ShortestPathResult) => void;
}

interface ConnectionRow {
  name: string;
  type: NodeType;
}

const COLORS = {
  ator: "#3b82f6",
  novela: "#f97316",
  edge: "#facc15",
};

/**
 * Monta o `data` de um nó, incluindo `img` SOMENTE quando houver URL não-vazia.
 * Cytoscape rejeita `background-image: ` vazio; sem a chave `img`, o seletor
 * node[img] não casa e o nó mostra só o fundo colorido (fallback sem avatar).
 */
function nodeData(d: {
  name: string;
  type: NodeType;
  img?: string;
  direction: "left" | "right";
  initial?: boolean;
}): Record<string, unknown> {
  const data: Record<string, unknown> = {
    id: d.name,
    label: d.name,
    type: d.type,
    direction: d.direction,
  };
  if (d.img) data.img = d.img;
  if (d.initial) data.initial = true;
  return data;
}

/**
 * Destaca visualmente o caminho vencedor no fim do jogo: os nós do caminho
 * (em ordem) e as arestas que ligam nós consecutivos recebem a classe
 * `on-path` (verde, borda grossa, nome visível). Todo o resto recebe
 * `dimmed` (esmaecido), para o jogador ver claramente a ligação entre os
 * dois atores iniciais.
 */
function highlightWinningPath(cy: Core, result: ShortestPathResult): void {
  const pathIds = result.nodes.map((n) => n.name);
  const pathIdSet = new Set(pathIds);

  // 1) esmaece tudo primeiro
  cy.elements().addClass("dimmed");

  // 2) realça os nós do caminho (tira o dim e marca on-path)
  pathIds.forEach((id) => {
    const node = cy.getElementById(id);
    if (!node.empty()) node.removeClass("dimmed").addClass("on-path");
  });

  // 3) realça as arestas entre nós consecutivos do caminho (nos dois sentidos)
  for (let i = 0; i < pathIds.length - 1; i++) {
    const a = pathIds[i];
    const b = pathIds[i + 1];
    const edges = cy.edges().filter((e) => {
      const s = e.source().id();
      const t = e.target().id();
      return (
        (s === a && t === b) ||
        (s === b && t === a) ||
        // guarda extra: ambos os extremos estão no caminho e adjacentes
        (pathIdSet.has(s) && pathIdSet.has(t) && Math.abs(pathIds.indexOf(s) - pathIds.indexOf(t)) === 1)
      );
    });
    edges.removeClass("dimmed").addClass("on-path");
  }

  // 4) enquadra o caminho em destaque
  const pathCollection = cy.collection();
  pathIds.forEach((id) => pathCollection.merge(cy.getElementById(id)));

  // força o Cytoscape a repintar as classes recém-aplicadas ANTES do fit,
  // senão o reflow do fit pode engolir a primeira pintura do destaque.
  cy.style().update();

  if (pathCollection.length > 0) {
    cy.animate({ fit: { eles: pathCollection, padding: 80 }, duration: 500 });
  }
}

const GameBoard = forwardRef<GameBoardHandle, GameBoardProps>(({ onWin }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const lastPathRef = useRef<ShortestPathResult | null>(null);

  // nó selecionado -> popover de conexões
  const [selected, setSelected] = useState<PlayedBoardNode | null>(null);
  const [rows, setRows] = useState<ConnectionRow[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ---- init Cytoscape (visível) ----
  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          // base: cor e rótulo comuns. Sem function-mappers (fragilizam o
          // boundingBox do Cytoscape) e sem background-image aqui — a imagem
          // só entra via o seletor node[img] abaixo, quando houver URL.
          selector: "node",
          style: {
            width: 72,
            height: 72,
            "background-color": "#111111",
            "background-fit": "cover",
            "border-width": 3,
            label: "data(label)",
            color: "#fff",
            "font-size": 11,
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-background-opacity": 0.9,
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle",
            "text-max-width": "120px",
            shape: "ellipse",
          },
        },
        {
          // só aplica a imagem quando `img` existe e é não-vazio
          selector: "node[img]",
          style: { "background-image": "data(img)" },
        },
        {
          selector: 'node[type = "ator"]',
          style: { "border-color": COLORS.ator, "text-background-color": COLORS.ator },
        },
        {
          selector: 'node[type = "novela"]',
          style: { "border-color": COLORS.novela, "text-background-color": COLORS.novela },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": COLORS.edge,
            "curve-style": "straight",
          },
        },
        {
          selector: "edge.path",
          style: {
            "line-color": COLORS.edge,
            width: 4,
            "line-style": "dashed",
            "line-dash-pattern": [8, 4],
          },
        },
        {
          // nós do caminho vencedor: borda verde grossa + glow, nome sempre visível
          selector: "node.on-path",
          style: {
            "border-width": 6,
            "border-color": "#22c55e",
            "text-background-color": "#16a34a",
            "text-background-opacity": 1,
            "z-index": 20,
          },
        },
        {
          // arestas do caminho vencedor: verde, sólida e grossa
          selector: "edge.on-path",
          style: {
            "line-color": "#22c55e",
            width: 6,
            "line-style": "solid",
            "z-index": 20,
          },
        },
        {
          // tudo que NÃO faz parte do caminho fica LEVEMENTE esmaecido no fim
          // do jogo — o suficiente para o caminho verde saltar, mas mantendo
          // a imagem dos nós fora do caminho perfeitamente visível.
          selector: ".dimmed",
          style: {
            opacity: 0.7,
          },
        },
      ],
      layout: { name: "preset" },
      // --- comportamento estilo "Connect the Stars" ---
      // arrastar o fundo = pan do board inteiro
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      // zoom in/out com scroll/trackpad
      userZoomingEnabled: true,
      wheelSensitivity: 0.2,
      minZoom: 0.3,
      maxZoom: 2.5,
      // nós individuais arrastáveis (star/film around)
      autoungrabify: false,
      autolock: false,
    });
    cyRef.current = cy;

    cy.on("tap", "node", (evt) => {
      const n = evt.target as NodeSingular;
      // o `data` do nó usa id/label; `name` == id. Montamos o PlayedBoardNode aqui.
      const selectedNode: PlayedBoardNode = {
        name: n.id(),
        type: n.data("type") as NodeType,
        img: n.data("img") as string | undefined,
        direction: (n.data("direction") as "left" | "right") ?? "left",
      };
      const rp = evt.renderedPosition ?? { x: 0, y: 0 };
      setSelected(selectedNode);
      setPopoverPos({ x: rp.x, y: rp.y });
      setFilterValue("");
      // conexões via grafo LOCAL (substitui o GET /atores/{n}/novelas | /novelas/{n}/atores)
      const connNames =
        selectedNode.type === "ator"
          ? listNovelasByAtor(selectedNode.name)
          : listAtoresByNovela(selectedNode.name);
      const connType: NodeType = selectedNode.type === "ator" ? "novela" : "ator";
      const already = new Set(cy.nodes().map((x) => x.id()));
      setRows(
        connNames
          .filter((name) => !already.has(name))
          .map((name) => ({ name, type: connType })),
      );
      setPopoverOpen(true);
    });

    // --- comportamento "Connect the Stars": arrastar != clicar ---
    // ao começar a arrastar um nó, ou ao dar pan/zoom no board, fecha o
    // popover de conexões (que fica ancorado numa posição renderizada e
    // ficaria desalinhado durante o movimento).
    cy.on("grab", "node", () => {
      setPopoverOpen(false);
    });
    cy.on("pan zoom", () => {
      setPopoverOpen(false);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // ---- verificação de caminho local (gatilho equivalente ao onNodesChange) ----
  const verifyPath = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const nodes = cy.nodes();
    if (nodes.length < 3) return;

    // os 2 iniciais são os marcados com flag initial
    const initials = nodes.filter((n) => n.data("initial")).map((n) => n.id());
    if (initials.length < 2) return;

    const played = nodes.map((n) => ({
      name: n.id(),
      type: n.data("type") as NodeType,
    }));

    const result = findFilterShortestPath(
      [initials[0], initials[1]],
      played,
    );
    lastPathRef.current = result;
    if (result.found) {
      highlightWinningPath(cy, result);
      // mostra o caminho destacado no board por ~1s ANTES de abrir o modal
      // (que cobre o tabuleiro), para o jogador enxergar a ligação encontrada.
      window.setTimeout(() => onWin(result), 1100);
    }
  }, [onWin]);

  // ---- adicionar um nó ao tabuleiro ----
  const addBoardNode = useCallback(
    async (source: PlayedBoardNode, row: ConnectionRow) => {
      const cy = cyRef.current;
      if (!cy) return;
      if (!cy.getElementById(row.name).empty()) return;

      // imagem via backend TMDB (preservado)
      let img = "";
      try {
        const url =
          row.type === "novela"
            ? `${env.VITE_API_ENDPOINT}/api/v1/novelas/${row.name}`
            : `${env.VITE_API_ENDPOINT}/api/v1/atores/${row.name}`;
        const res = await axios.get(url);
        img = res.data.img;
      } catch (error) {
        console.error("[GameBoard] TMDB image fetch failed", error);
      }

      const sourceNode = cy.getElementById(source.name);
      const basePos = sourceNode.empty()
        ? { x: 0, y: 0 }
        : { ...sourceNode.position() };

      cy.add({
        group: "nodes",
        data: nodeData({ name: row.name, type: row.type, img, direction: source.direction }),
        position: { x: basePos.x + (source.direction === "left" ? -120 : 120), y: basePos.y + 150 },
      });

      // auto-conecta a TODOS os nós já no tabuleiro que são vizinhos no grafo completo
      const neighborNames =
        row.type === "ator" ? listNovelasByAtor(row.name) : listAtoresByNovela(row.name);
      const neighborSet = new Set(neighborNames);
      cy.nodes().forEach((other) => {
        if (other.id() === row.name) return;
        if (neighborSet.has(other.id())) {
          const edgeId = `${other.id()}-${row.name}`;
          const edgeIdRev = `${row.name}-${other.id()}`;
          if (cy.getElementById(edgeId).empty() && cy.getElementById(edgeIdRev).empty()) {
            cy.add({ group: "edges", data: { id: edgeId, source: other.id(), target: row.name } });
          }
        }
      });

      cy.layout({ name: "cose", animate: false, fit: true, padding: 40 }).run();
      cy.fit(undefined, 60);
      setPopoverOpen(false);
      setFilterValue("");
      // roda a verificação APÓS o layout/fit assentarem e pintarem, senão o
      // destaque do caminho (classes on-path/dimmed) é sobrescrito pelo fit.
      requestAnimationFrame(() => verifyPath());
    },
    [verifyPath],
  );

  // ---- API imperativa para o App (novo jogo) ----
  useImperativeHandle(ref, () => ({
    reset: (left, right) => {
      const cy = cyRef.current;
      if (!cy) return;
      cy.elements().remove();
      lastPathRef.current = null;
      cy.add([
        {
          group: "nodes",
          data: nodeData({ name: left.name, type: "ator", img: left.img, direction: "left", initial: true }),
          position: { x: -150, y: 0 },
        },
        {
          group: "nodes",
          data: nodeData({ name: right.name, type: "ator", img: right.img, direction: "right", initial: true }),
          position: { x: 150, y: 0 },
        },
      ]);
      cy.fit(undefined, 80);
    },
    getPath: () => lastPathRef.current,
  }));

  const filteredRows = rows.filter((r) =>
    r.name.toLowerCase().includes(filterValue.toLowerCase()),
  );

  return (
    <Box style={{ position: "relative", width: "100%", height: "100%", zIndex: 2 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        {/* âncora posicionada sobre o nó clicado */}
        <Popover.Trigger>
          <span
            style={{
              position: "absolute",
              left: popoverPos.x,
              top: popoverPos.y,
              width: 1,
              height: 1,
            }}
          />
        </Popover.Trigger>
        <Popover.Content>
          {selected && (
            <>
              <Box mb="2">
                <TextField.Root
                  placeholder={`Filtrar ${selected.type === "ator" ? "novelas" : "atores"}...`}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              </Box>
              <ScrollArea type="always" scrollbars="vertical" style={{ height: 200 }}>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>
                        {selected.type === "ator" ? "Novelas" : "Atores"}
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredRows.map((row, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>{row.name}</Table.Cell>
                        <Table.Cell>
                          <Button size="1" onClick={() => addBoardNode(selected, row)}>
                            <PlusIcon />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </ScrollArea>
              <Flex gap="3" mt="3" justify="end">
                <Button variant="soft" color="gray" onClick={() => setPopoverOpen(false)}>
                  Fechar
                </Button>
              </Flex>
            </>
          )}
        </Popover.Content>
      </Popover.Root>
    </Box>
  );
});

GameBoard.displayName = "GameBoard";
export default GameBoard;

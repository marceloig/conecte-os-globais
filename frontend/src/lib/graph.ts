/**
 * graph.ts — camada de dados do grafo no FRONTEND, substituindo o Neo4jRepository.
 *
 * Antes: o backend consultava o Neo4j remoto (atores/novelas/relações + shortestPath).
 * Agora: o grafo completo vive num Cytoscape HEADLESS em memória, montado a partir
 * do dataset estático `src/data/graph.json` (gerado dos CSVs por scripts/build-graph.py).
 *
 * Por que Cytoscape headless como "banco":
 *  - É um motor de grafos de verdade: expõe aStar/bfs/dijkstra nativos — exatamente
 *    o que a query `shortestPath` do Cypher fazia.
 *  - A estrutura consultável É a própria instância cy, satisfazendo o requisito de
 *    "persistir usando o próprio Cytoscape / solução consultável pelo Cytoscape".
 *  - localStorage (~5 MB, API síncrona) não comporta 20k+ arestas como JSON, e um
 *    IndexedDB puro não traria travessia pronta. Então: dataset como asset estático,
 *    carregado 1x, com cache opcional em IndexedDB (ver cacheGraphElements abaixo).
 *
 * Esta camada expõe os 4 métodos do repositório antigo, com a MESMA semântica:
 *   - getRandomAtor()                         ~ get_random_atores (ORDER BY rand() LIMIT 1)
 *   - listNovelasByAtor(name)                 ~ list_novelas_by_ator (ordenado por nome)
 *   - listAtoresByNovela(name)                ~ list_atores_by_novela (ordenado por nome)
 *   - findFilterShortestPath(initial, played) ~ find_filter_shortest_path (shortestPath + WHERE ALL)
 */
import cytoscape, { type Core, type ElementsDefinition } from "cytoscape";
import rawGraph from "@/data/graph.json";

export type NodeType = "ator" | "novela";

export interface GraphNodeData {
  id: string;
  label: string;
  type: NodeType;
}

export interface PlayedNode {
  /** nome legível, idêntico ao `id` no dataset */
  name: string;
  type: NodeType;
}

export interface ShortestPathResult {
  /** nós do caminho, em ordem, do ator inicial 1 ao ator inicial 2 */
  nodes: PlayedNode[];
  /** grau de separação = número de ARESTAS no caminho (== length(path) no Cypher) */
  grau: number;
  found: boolean;
}

const elements = rawGraph as unknown as ElementsDefinition;

/**
 * Instância headless única (singleton) com o grafo COMPLETO.
 * `headless: true` evita qualquer render — é só o índice de grafo em memória.
 */
let fullGraph: Core | null = null;

export function getFullGraph(): Core {
  if (!fullGraph) {
    fullGraph = cytoscape({ headless: true, elements });
  }
  return fullGraph;
}

/** Sorteia um ator aleatório (equivalente a ORDER BY rand() LIMIT 1). */
export function getRandomAtor(): string {
  const atores = getFullGraph().nodes('[type = "ator"]');
  const idx = Math.floor(Math.random() * atores.length);
  return atores[idx].data("label");
}

/** Novelas em que um ator atuou, ordenadas por nome. */
export function listNovelasByAtor(ator: string): string[] {
  const node = getFullGraph().getElementById(ator);
  if (node.empty()) return [];
  const novelas = node
    .neighborhood('node[type = "novela"]')
    .map((n) => n.data("label") as string);
  return Array.from(new Set(novelas)).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Atores que atuaram numa novela, ordenados por nome. */
export function listAtoresByNovela(novela: string): string[] {
  const node = getFullGraph().getElementById(novela);
  if (node.empty()) return [];
  const atores = node
    .neighborhood('node[type = "ator"]')
    .map((n) => n.data("label") as string);
  return Array.from(new Set(atores)).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Caminho mais curto entre os 2 atores iniciais, restrito aos nós JOGADOS.
 *
 * Equivalência com o Cypher antigo:
 *   MATCH path = shortestPath((src)-[*]-(tgt))
 *   WHERE ALL(n in nodes(path) WHERE n.name IN $atores|$novelas jogados)
 *
 * A cláusula `WHERE ALL(... jogados ...)` é satisfeita CONSTRUTIVAMENTE: montamos
 * um subgrafo induzido contendo apenas os nós jogados (incluindo os 2 iniciais) e
 * as arestas entre eles, e rodamos aStar nesse subgrafo. Como o subgrafo já só tem
 * nós permitidos, qualquer caminho encontrado respeita o WHERE ALL automaticamente.
 *
 * O grafo é tratado como NÃO-DIRIGIDO (o Cypher usava `-[*]-`): aStar com
 * `directed: false`.
 */
export function findFilterShortestPath(
  initialAtores: [string, string],
  playedNodes: PlayedNode[],
): ShortestPathResult {
  const notFound: ShortestPathResult = { nodes: [], grau: 0, found: false };

  const [sourceName, targetName] = initialAtores;
  const allowed = new Set(playedNodes.map((n) => n.name));
  // os 2 iniciais sempre fazem parte do conjunto permitido
  allowed.add(sourceName);
  allowed.add(targetName);

  const full = getFullGraph();

  // subgrafo induzido pelos nós jogados
  const allowedNodes = full.nodes().filter((n) => allowed.has(n.id()));
  if (allowedNodes.length < 3) return notFound;
  const induced = allowedNodes.union(allowedNodes.edgesWith(allowedNodes));

  const source = induced.getElementById(sourceName);
  const target = induced.getElementById(targetName);
  if (source.empty() || target.empty()) return notFound;

  const result = induced.aStar({
    root: source,
    goal: target,
    directed: false,
  });

  if (!result.found || !result.path) return notFound;

  const pathNodes = result.path
    .nodes()
    .map((n) => ({ name: n.data("label") as string, type: n.data("type") as NodeType }));

  // length(path) do Cypher = número de arestas = (nós - 1)
  const grau = pathNodes.length - 1;

  return { nodes: pathNodes, grau, found: true };
}

/* ------------------------------------------------------------------ *
 * Cache opcional em IndexedDB — evita re-baixar o graph.json a cada
 * visita. O dataset vem embarcado no bundle de qualquer forma; isto é
 * um "nice to have" para carregamentos subsequentes se o dataset for
 * servido como asset externo no futuro. Mantido pequeno e sem libs.
 * ------------------------------------------------------------------ */
const DB_NAME = "conecte-os-globais";
const STORE = "graph";
const KEY = "elements-v1";

export function cacheGraphElements(): void {
  if (typeof indexedDB === "undefined") return;
  try {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(elements, KEY);
    };
  } catch {
    /* cache é best-effort; falha silenciosa não afeta o jogo */
  }
}

import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Testa a camada graph.ts (Cytoscape headless) com um dataset PEQUENO mockado,
 * validando a equivalência com a semântica do Neo4j antigo:
 *  - getRandomAtor só devolve nós ator
 *  - listNovelasByAtor / listAtoresByNovela: vizinhos corretos, ordenados, únicos
 *  - findFilterShortestPath: shortestPath restrito aos nós jogados (WHERE ALL),
 *    não-dirigido, com grau = nº de arestas
 */

// grafo mínimo: A -(N1)- B -(N2)- C   e um desvio A -(N3)- C (curto)
const mockGraph = {
  nodes: [
    { data: { id: "A", label: "A", type: "ator" } },
    { data: { id: "B", label: "B", type: "ator" } },
    { data: { id: "C", label: "C", type: "ator" } },
    { data: { id: "N1", label: "N1", type: "novela" } },
    { data: { id: "N2", label: "N2", type: "novela" } },
    { data: { id: "N3", label: "N3", type: "novela" } },
  ],
  edges: [
    { data: { id: "A__N1", source: "A", target: "N1" } },
    { data: { id: "B__N1", source: "B", target: "N1" } },
    { data: { id: "B__N2", source: "B", target: "N2" } },
    { data: { id: "C__N2", source: "C", target: "N2" } },
    { data: { id: "A__N3", source: "A", target: "N3" } },
    { data: { id: "C__N3", source: "C", target: "N3" } },
  ],
};

vi.mock("@/data/graph.json", () => ({ default: mockGraph }));

let graph: typeof import("@/lib/graph");

beforeEach(async () => {
  vi.resetModules();
  graph = await import("@/lib/graph");
});

describe("graph.ts — camada local (substituta do Neo4j)", () => {
  it("getRandomAtor devolve apenas atores", () => {
    for (let i = 0; i < 20; i++) {
      expect(["A", "B", "C"]).toContain(graph.getRandomAtor());
    }
  });

  it("listNovelasByAtor devolve novelas vizinhas, ordenadas e únicas", () => {
    expect(graph.listNovelasByAtor("A")).toEqual(["N1", "N3"]);
    expect(graph.listNovelasByAtor("B")).toEqual(["N1", "N2"]);
  });

  it("listAtoresByNovela devolve atores vizinhos", () => {
    expect(graph.listAtoresByNovela("N1")).toEqual(["A", "B"]);
    expect(graph.listAtoresByNovela("N2")).toEqual(["B", "C"]);
  });

  it("findFilterShortestPath acha o caminho curto A-N3-C quando N3 foi jogado", () => {
    const played = [
      { name: "A", type: "ator" as const },
      { name: "C", type: "ator" as const },
      { name: "N3", type: "novela" as const },
    ];
    const r = graph.findFilterShortestPath(["A", "C"], played);
    expect(r.found).toBe(true);
    expect(r.nodes.map((n) => n.name)).toEqual(["A", "N3", "C"]);
    expect(r.grau).toBe(2); // 2 arestas
  });

  it("respeita WHERE ALL: sem N3 jogado, usa o caminho mais longo via B/N1/N2", () => {
    const played = [
      { name: "A", type: "ator" as const },
      { name: "C", type: "ator" as const },
      { name: "B", type: "ator" as const },
      { name: "N1", type: "novela" as const },
      { name: "N2", type: "novela" as const },
    ];
    const r = graph.findFilterShortestPath(["A", "C"], played);
    expect(r.found).toBe(true);
    expect(r.nodes.map((n) => n.name)).toEqual(["A", "N1", "B", "N2", "C"]);
    expect(r.grau).toBe(4);
  });

  it("não encontra caminho quando os nós jogados não conectam os iniciais", () => {
    const played = [
      { name: "A", type: "ator" as const },
      { name: "C", type: "ator" as const },
      { name: "N1", type: "novela" as const }, // N1 só liga A-B, não chega em C
    ];
    const r = graph.findFilterShortestPath(["A", "C"], played);
    expect(r.found).toBe(false);
    expect(r.grau).toBe(0);
  });
});

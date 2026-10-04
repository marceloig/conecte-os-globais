#!/usr/bin/env python3
"""
build-graph.py — converte os 3 CSVs do Neo4j (../../neo4j/*.csv) no dataset
embarcado do frontend Cytoscape: src/data/graph.json.

Formato de saída = elements do Cytoscape.js:
{
  "nodes": [{ "data": { "id", "label", "type" } }, ...],
  "edges": [{ "data": { "id", "source", "target", "personagem" } }, ...]
}

Convenções (equivalentes ao backend atual):
- type "ator"   para nós de atores   (CSV ~label "Ator")
- type "novela" para nós de novelas  (CSV ~label "Novela")
- `id` do nó = o `name` legível (ex. "Afrânio Gama"), porque o jogo inteiro
  identifica nós pelo nome (data.label no ReactFlow, name nas queries). Assim o
  pathfinding e a montagem de arestas no front usam a mesma chave de sempre.
- aresta `atua_em` é NÃO-direcionada no pathfinding; guardamos source=ator,
  target=novela por convenção, mas o aStar/bfs trata o grafo como não-dirigido.

Sem dependências externas — só a stdlib (csv, json).
"""
from __future__ import annotations

import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
# frontend/scripts/ -> raiz do repo é dois níveis acima
REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
NEO4J_DIR = os.path.join(REPO_ROOT, "neo4j")
OUT_DIR = os.path.join(HERE, "..", "src", "data")
OUT_FILE = os.path.join(OUT_DIR, "graph.json")

ATORES_CSV = os.path.join(NEO4J_DIR, "atores_nodes.csv")
NOVELAS_CSV = os.path.join(NEO4J_DIR, "novelas_nodes.csv")
RELS_CSV = os.path.join(NEO4J_DIR, "relationships.csv")


def read_nodes(path: str, node_type: str) -> tuple[list[dict], dict[str, str]]:
    """Lê um CSV de nós. Retorna (elements, map ~id->name)."""
    elements: list[dict] = []
    id_to_name: dict[str, str] = {}
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            raw_id = row["~id"].strip()
            name = row["name"].strip()
            if not name:
                continue
            id_to_name[raw_id] = name
            elements.append({
                "data": {"id": name, "label": name, "type": node_type}
            })
    return elements, id_to_name


def read_edges(path: str, id_to_name: dict[str, str]) -> list[dict]:
    """Lê relationships.csv e resolve ~from/~to para os `name` dos nós."""
    edges: list[dict] = []
    seen: set[str] = set()
    skipped = 0
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            src_raw = row["~from"].strip()
            tgt_raw = row["~to"].strip()
            src = id_to_name.get(src_raw)
            tgt = id_to_name.get(tgt_raw)
            if not src or not tgt:
                skipped += 1
                continue
            edge_id = f"{src}__{tgt}"
            if edge_id in seen:
                continue
            seen.add(edge_id)
            edges.append({
                "data": {
                    "id": edge_id,
                    "source": src,
                    "target": tgt,
                    "personagem": (row.get("personagem") or "").strip(),
                }
            })
    if skipped:
        print(f"[build-graph] aviso: {skipped} arestas puladas (nó ausente)", file=sys.stderr)
    return edges


def main() -> int:
    for p in (ATORES_CSV, NOVELAS_CSV, RELS_CSV):
        if not os.path.exists(p):
            print(f"[build-graph] CSV não encontrado: {p}", file=sys.stderr)
            return 1

    atores, atores_map = read_nodes(ATORES_CSV, "ator")
    novelas, novelas_map = read_nodes(NOVELAS_CSV, "novela")

    # ids de nós devem ser únicos globalmente; name de ator e de novela não
    # colidem na prática, mas garantimos o merge dos mapas para resolver arestas.
    id_to_name = {**atores_map, **novelas_map}

    edges = read_edges(RELS_CSV, id_to_name)

    graph = {"nodes": atores + novelas, "edges": edges}

    os.makedirs(os.path.abspath(OUT_DIR), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as fh:
        json.dump(graph, fh, ensure_ascii=False, separators=(",", ":"))

    print(
        f"[build-graph] escrito {os.path.abspath(OUT_FILE)}: "
        f"{len(atores)} atores, {len(novelas)} novelas, {len(edges)} arestas"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

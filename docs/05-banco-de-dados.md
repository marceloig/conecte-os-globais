# 05 — Banco de Dados (Neo4j)

## Por que Neo4j?

O Neo4j é um banco de dados de grafos nativo, ideal para este projeto porque:

- O domínio do problema é naturalmente um grafo (atores conectados a novelas)
- A operação central do jogo é encontrar o **caminho mais curto** entre dois nós
- A função `shortestPath` do Neo4j é otimizada para esse tipo de consulta
- Queries de travessia de grafos são significativamente mais rápidas que JOINs em bancos relacionais

## Modelo de Dados

### Nós (Nodes)

#### Atores

```
(:Atores {name: "Nome do Ator"})
```

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `name` | string | Nome completo do ator |

#### Novelas

```
(:Novelas {name: "Nome da Novela"})
```

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `name` | string | Nome da novela |

### Relacionamentos (Relationships)

#### atua_em / ACTED_IN

```
(:Atores)-[:atua_em]->(:Novelas)
```

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `personagem` | string (opcional) | Nome do personagem interpretado |

### Diagrama do Grafo

```
                    ┌──────────────┐
                    │   Novela A   │
                    └──────┬───────┘
                           │ atua_em
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼────┐ ┌─────▼─────┐
        │  Ator 1   │ │ Ator 2 │ │  Ator 3   │
        └─────┬─────┘ └───┬────┘ └─────┬─────┘
              │            │            │
              │ atua_em    │ atua_em    │ atua_em
              │            │            │
        ┌─────▼─────┐ ┌───▼────┐ ┌─────▼─────┐
        │  Novela B  │ │Novela C│ │  Novela D  │
        └────────────┘ └────────┘ └────────────┘
```

## Arquivos de Importação (CSV)

Os dados são importados para o Neo4j via arquivos CSV localizados em `neo4j/`.

### `atores_nodes.csv`

```csv
~id,~label,name
"ator_Afrnio_Gama","Ator","Afrânio Gama"
"ator_Aisha_Jambo","Ator","Aisha Jambo"
"ator_Alexandre_David","Ator","Alexandre David"
```

| Coluna | Descrição |
|--------|-----------|
| `~id` | Identificador único (formato: `ator_Nome_Sobrenome`) |
| `~label` | Label do nó (`Ator`) |
| `name` | Nome completo do ator |

### `novelas_nodes.csv`

```csv
~id,~label,name
"novela_Cabocla__2_verso","Novela","Cabocla - 2ª versão"
"novela_Cama_de_Gato","Novela","Cama de Gato"
"novela_Cambalacho","Novela","Cambalacho"
```

| Coluna | Descrição |
|--------|-----------|
| `~id` | Identificador único (formato: `novela_Nome_Da_Novela`) |
| `~label` | Label do nó (`Novela`) |
| `name` | Nome da novela |

### `relationships.csv`

```csv
~id,~from,~to,~label,personagem
"ator_Afrnio_Gama_acted_in_novela_Cabocla__2_verso","ator_Afrnio_Gama","novela_Cabocla__2_verso","ACTED_IN",
"ator_Aisha_Jambo_acted_in_novela_Cabocla__2_verso","ator_Aisha_Jambo","novela_Cabocla__2_verso","ACTED_IN","Ritinha"
```

| Coluna | Descrição |
|--------|-----------|
| `~id` | Identificador único do relacionamento |
| `~from` | ID do nó de origem (ator) |
| `~to` | ID do nó de destino (novela) |
| `~label` | Tipo do relacionamento (`ACTED_IN`) |
| `personagem` | Nome do personagem (opcional) |

## Queries Cypher

### Ator Aleatório

```cypher
MATCH (a:Atores)
RETURN a.name AS nome
ORDER BY rand()
LIMIT 1
```

### Novelas de um Ator

```cypher
MATCH (a:Atores)-[:atua_em]->(n:Novelas)
WHERE a.name = $ator
RETURN n.name AS novela
ORDER BY n.name
```

### Atores de uma Novela

```cypher
MATCH (a:Atores)-[:atua_em]->(n:Novelas)
WHERE n.name = $novela
RETURN a.name AS ator
ORDER BY a.name
```

### Caminho Mais Curto (Filtrado)

Esta é a query principal do jogo:

```cypher
MATCH path = shortestPath(
    (source:Atores {name: $source_ator})-[*]-(target:Atores {name: $target_ator})
)
WHERE ALL(n in nodes(path) WHERE
    (('Atores' IN labels(n) AND n.name IN $atores) OR
     ('Novelas' IN labels(n) AND n.name IN $novelas))
)
RETURN path, length(path) as grau
```

**Parâmetros:**
- `$source_ator` — Nome do primeiro ator (inicial esquerdo)
- `$target_ator` — Nome do segundo ator (inicial direito)
- `$atores` — Lista de nomes de atores adicionados pelo jogador
- `$novelas` — Lista de nomes de novelas adicionadas pelo jogador

**Comportamento:**
- Usa `shortestPath` para encontrar o caminho mais curto entre os dois atores
- O filtro `WHERE ALL` garante que **todos** os nós intermediários do caminho estejam na lista de nós que o jogador adicionou
- Se não existir caminho válido com os nós disponíveis, retorna `null`
- `length(path)` retorna o grau de separação (número de arestas)

## Observações sobre Labels

Existe uma diferença entre os labels nos CSVs e nas queries:

| CSV | Query Cypher |
|-----|-------------|
| `Ator` | `Atores` |
| `Novela` | `Novelas` |
| `ACTED_IN` | `atua_em` |

Isso indica que os dados podem ter sido transformados durante a importação para o Neo4j, ou que os labels no banco diferem dos CSVs de importação.

## Conexão com o Banco

### Local (via Docker Compose)

```yaml
db:
  image: neo4j:2025.07.0
  ports:
    - "7474:7474"    # Browser HTTP
  volumes:
    - neo4j_data:/var/lib/neo4j/data
```

- **Neo4j Browser**: `http://localhost:7474`
- **Bolt Protocol**: `neo4j://localhost:7687`

### Remoto (via AWS SSM)

Para conectar ao Neo4j hospedado em uma instância EC2 via port forwarding:

```bash
aws ssm start-session \
    --target i-xxxxxxxxxxx \
    --document-name AWS-StartPortForwardingSession \
    --parameters '{"portNumber":["7687"], "localPortNumber":["56789"]}'
```

Isso mapeia a porta remota `7687` para a porta local `56789`, permitindo conexão via `neo4j://localhost:56789`.

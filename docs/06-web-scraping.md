# 06 — Web Scraping (Scrapy)

## Visão Geral

O módulo de scraping é responsável por coletar dados de elenco das novelas da Globo a partir do site **Memória Globo** (`memoriaglobo.globo.com`). Esses dados são posteriormente processados e importados para o banco Neo4j.

## Estrutura de Diretórios

```
scrapy/
├── memoriaglobo/
│   ├── memoriaglobo/
│   │   ├── __init__.py
│   │   ├── items.py            # Definição de items (não utilizado)
│   │   ├── middlewares.py      # Middlewares (padrão Scrapy)
│   │   ├── pipelines.py       # Pipelines (placeholder)
│   │   ├── settings.py        # Configurações do Scrapy
│   │   └── spiders/
│   │       ├── __init__.py
│   │       └── novelas_spider.py  # Spider principal
│   ├── novelas.csv             # Dados coletados (CSV)
│   ├── novelas.json            # Dados coletados (JSON)
│   └── scrapy.cfg              # Configuração do projeto Scrapy
└── tutorial/                   # Projeto tutorial (aprendizado)
```

## Spider: `NovelasSpider`

**Arquivo:** `scrapy/memoriaglobo/memoriaglobo/spiders/novelas_spider.py`

### Fluxo de Coleta

```
1. start_requests()
   │
   │  URL: https://memoriaglobo.globo.com/entretenimento/novelas/
   │
   ▼
2. parse()
   │
   │  Extrai links de todas as novelas do índice A-Z
   │  Seletor: div.show-indice-artistas-az-section-items > section > ul > li > a
   │
   ▼
3. parse_novela()
   │
   │  Para cada novela, navega para a ficha técnica
   │  URL: {novela_url}/noticia/ficha-tecnica.ghtml
   │
   ▼
4. parse_ficha_tecnica()
   │
   │  Extrai nome da novela e lista de elenco
   │  Retorna: { novela, elenco: [{ator, personagem}] }
```

### Extração de Dados

#### Nome da Novela

```css
#header-tabs-navigation > ul > li:nth-child(1) > a::text
```

#### Elenco (Ficha Técnica)

O spider tenta múltiplos seletores CSS para lidar com variações no layout das páginas:

```python
# Tentativa 1
"article > div:nth-child(4) > div > p::text"

# Tentativa 2
"article > div:nth-child(4) > div:nth-child(1) > div > p::text"

# Tentativa 3
"article > div:nth-child(4) > div:nth-child(1) > div > ul > li::text"

# Tentativa 4
"article > div:nth-child(4) > div:nth-child(2) > div > p::text"

# Tentativa 5
"article > div:nth-child(4) > div:nth-child(2) > div > div > p::text"

# Tentativa 6
"article > div:nth-child(5) > div > p::text"
```

#### Parsing do Elenco

O texto do elenco pode vir em dois formatos:

```
"Nome do Ator – Personagem"    →  split(" – ")
"Nome do Ator (Personagem)"   →  split("(")
"Nome do Ator"                 →  sem personagem
```

### Saída

```json
{
    "novela": "Cabocla - 2ª versão",
    "elenco": [
        {"ator": "Afrânio Gama", "personagem": ""},
        {"ator": "Aisha Jambo", "personagem": "Ritinha"},
        {"ator": "Alexandre David"}
    ]
}
```

Os dados são exportados para `novelas.csv` e `novelas.json`.

## Configurações (`settings.py`)

| Configuração | Valor | Descrição |
|-------------|-------|-----------|
| `BOT_NAME` | `"memoriaglobo"` | Nome do bot |
| `ROBOTSTXT_OBEY` | `True` | Respeita robots.txt |
| `TWISTED_REACTOR` | `AsyncioSelectorReactor` | Reactor async |
| `FEED_EXPORT_ENCODING` | `"utf-8"` | Encoding UTF-8 para exportação |

## Como Executar

```bash
cd scrapy/memoriaglobo

# Exportar para JSON
scrapy crawl novelas -O novelas.json

# Exportar para CSV
scrapy crawl novelas -O novelas.csv
```

## Pipeline de Dados

O fluxo completo desde a coleta até o banco de dados:

```
Memória Globo (web)
       │
       │  Scrapy Spider
       ▼
novelas.json / novelas.csv
       │
       │  Processamento (manual/script)
       ▼
neo4j/atores_nodes.csv
neo4j/novelas_nodes.csv
neo4j/relationships.csv
       │
       │  Importação Neo4j
       ▼
Neo4j Database
  (Atores)─[:atua_em]─>(Novelas)
```

Os arquivos CSV na pasta `neo4j/` seguem o formato de importação do Neo4j, com colunas prefixadas por `~` (`~id`, `~label`, `~from`, `~to`).

## Projeto Tutorial

A pasta `scrapy/tutorial/` contém um projeto de aprendizado do Scrapy baseado no tutorial oficial (quotes.toscrape.com). Não é utilizado em produção.

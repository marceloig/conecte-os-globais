# 09 — Guia de Desenvolvimento

## Pré-requisitos

| Ferramenta | Versão Mínima | Uso |
|------------|---------------|-----|
| Node.js | 20+ | Frontend |
| npm | 9+ | Gerenciador de pacotes frontend |
| Python | 3.11+ | Backend + script de build do grafo |
| pip | 23+ | Gerenciador de pacotes Python |
| Docker | 24+ | Containerização (opcional) |
| Docker Compose | 2.0+ | Orquestração (opcional) |

> Não é necessário Neo4j: o grafo é um dataset estático servido pelo Cytoscape no
> frontend. O backend só precisa de um `TMDB_API_TOKEN`.

## Setup Local

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd conecte-os-globais
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux   (Windows: venv\Scripts\activate)
pip install -r requirements.txt
cp .env.example .env       # editar com o TMDB_API_TOKEN
uvicorn app.main:app --reload --port 8000
```

**Variáveis obrigatórias no `.env`:**
- `TMDB_API_TOKEN` — token da API TMDB ([obter aqui](https://www.themoviedb.org/settings/api))
- `FRONTEND_URL` — origem do frontend para CORS (padrão `http://localhost:5173`)

O backend estará em `http://localhost:8000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run build:graph        # gera src/data/graph.json a partir dos CSVs em ../neo4j
echo "VITE_API_ENDPOINT=http://localhost:8000" > .env
npm run dev
```

O frontend estará em `http://localhost:5173` (use essa origem — é a permitida pelo
CORS do backend por padrão). O backend só é necessário para as **imagens**; toda a
lógica de grafo roda offline.

## Comandos Úteis

### Backend

```bash
uvicorn app.main:app --reload --port 8000   # servidor com hot reload
pytest                                       # testes
pytest -v                                    # testes verbose
```

### Frontend

```bash
npm run dev           # servidor de desenvolvimento
npm run build:graph   # regenera o dataset do grafo (se os CSVs mudaram)
npm run build         # typecheck + build de produção
npm run preview       # preview do build
npm test              # vitest
npm run lint          # eslint
```

### Docker

```bash
docker-compose up --build       # subir backend
docker-compose up -d --build    # background
docker-compose down             # parar
docker-compose logs -f api      # logs
```

### Scrapy

```bash
cd scrapy/memoriaglobo
scrapy crawl novelas -O novelas.json
scrapy crawl novelas -O novelas.csv
```

## Fluxo de Trabalho

### Adicionando uma nova consulta de grafo

1. Implementar a função em `frontend/src/lib/graph.ts` (usando a instância
   Cytoscape headless — `getFullGraph()`).
2. Adicionar um teste em `frontend/src/tests/lib/graph.test.ts`.
3. Consumir a função no `GameBoard.tsx` / `App.tsx`.

### Adicionando um novo endpoint no backend

1. Definir/ajustar o modelo Pydantic em `backend/app/models.py`.
2. Criar o handler em `backend/app/api/v1/endpoints.py` (usando o `TMDBService`
   quando precisar de imagens).
3. Testar via Swagger UI (`http://localhost:8000/docs`).

### Adicionando um novo componente React

1. Criar o componente em `frontend/src/components/`.
2. Importar e usar no componente pai (ex.: `App.tsx` ou `GameBoard.tsx`).

### Atualizando os dados do grafo

1. Executar o spider Scrapy para coletar dados atualizados.
2. Processar/atualizar os CSVs em `neo4j/`.
3. Rodar `npm run build:graph` para regenerar `frontend/src/data/graph.json`.

## Estrutura de Branches

```
main            ← Produção
├── develop     ← Desenvolvimento
│   ├── feature/nome-da-feature
│   ├── fix/nome-do-bug
│   └── chore/nome-da-tarefa
```

## Obtendo Token TMDB

1. Criar conta em [themoviedb.org](https://www.themoviedb.org/).
2. Acessar **Settings → API**.
3. Solicitar uma API key.
4. Copiar o **API Read Access Token** (Bearer token).
5. Adicionar ao `.env` como `TMDB_API_TOKEN`.

## Troubleshooting

### Erro CORS no frontend

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solução:** rode o frontend em `http://localhost:5173` (origem permitida por
`FRONTEND_URL`) ou adicione sua origem a `CORS_ORIGINS` no `.env` do backend.
Reinicie o backend após alterar.

### Imagens não carregam (TMDB)

**Solução:** verificar o `TMDB_API_TOKEN`. Testar diretamente:

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  "https://api.themoviedb.org/3/search/person?query=Fernanda+Montenegro&language=pt-BR"
```

### Board vazio / grafo não carrega

**Solução:** confirmar que `frontend/src/data/graph.json` existe. Se faltar, rode
`npm run build:graph` (precisa dos CSVs em `neo4j/`).

### Frontend não conecta ao backend

**Solução:** verificar `VITE_API_ENDPOINT` no `.env` do frontend e reiniciar o
Vite após alterar variáveis de ambiente.

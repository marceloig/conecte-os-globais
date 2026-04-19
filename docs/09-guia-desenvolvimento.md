# 09 — Guia de Desenvolvimento

## Pré-requisitos

| Ferramenta | Versão Mínima | Uso |
|------------|---------------|-----|
| Node.js | 18+ | Frontend |
| npm | 9+ | Gerenciador de pacotes frontend |
| Python | 3.11+ | Backend |
| pip | 23+ | Gerenciador de pacotes Python |
| Docker | 24+ | Containerização (opcional) |
| Docker Compose | 2.0+ | Orquestração (opcional) |
| Neo4j | 5.x | Banco de dados de grafos |
| AWS CLI | 2.x | Conexão remota com Neo4j (opcional) |

## Setup Local

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd conecte-os-globais
```

### 2. Backend

```bash
# Entrar no diretório
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

**Variáveis obrigatórias no `.env`:**
- `NEO4J_URI` — URI do banco Neo4j
- `NEO4J_AUTH_USER` — Usuário Neo4j
- `NEO4J_AUTH_PASSWORD` — Senha Neo4j
- `TMDB_API_TOKEN` — Token da API TMDB ([obter aqui](https://www.themoviedb.org/settings/api))

```bash
# Iniciar o servidor
uvicorn app.main:app --reload --port 8000
```

O backend estará disponível em `http://localhost:8000`.

### 3. Frontend

```bash
# Entrar no diretório
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar/editar .env com:
echo "VITE_API_ENDPOINT=http://localhost:8000" > .env
```

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

### 4. Neo4j (via Docker)

```bash
cd backend
docker-compose up db
```

Ou, se preferir rodar apenas o Neo4j:

```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  -v neo4j_data:/data \
  neo4j:2025.07.0
```

Acesse o Neo4j Browser em `http://localhost:7474`.

### 5. Importar Dados no Neo4j

Os arquivos CSV em `neo4j/` precisam ser importados no banco. Consulte a documentação do Neo4j para importação via `LOAD CSV` ou ferramentas como `neo4j-admin import`.

## Comandos Úteis

### Backend

```bash
# Iniciar servidor com hot reload
uvicorn app.main:app --reload --port 8000

# Rodar testes
pytest

# Rodar testes com verbose
pytest -v

# Verificar formatação
# (instalar: pip install ruff)
ruff check .
```

### Frontend

```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

### Docker

```bash
# Subir tudo
docker-compose up --build

# Subir em background
docker-compose up -d --build

# Parar
docker-compose down

# Rebuild apenas o backend
docker-compose build api

# Logs do backend
docker-compose logs -f api

# Logs do Neo4j
docker-compose logs -f db
```

### Scrapy

```bash
cd scrapy/memoriaglobo

# Executar spider (JSON)
scrapy crawl novelas -O novelas.json

# Executar spider (CSV)
scrapy crawl novelas -O novelas.csv

# Executar com log detalhado
scrapy crawl novelas -O novelas.json --loglevel=DEBUG
```

## Fluxo de Trabalho

### Adicionando um Novo Endpoint

1. Definir o modelo Pydantic em `backend/app/models.py`
2. Adicionar a query Cypher em `backend/app/db/neo4j.py`
3. Criar o handler em `backend/app/api/v1/endpoints.py`
4. Testar via Swagger UI (`http://localhost:8000/docs`)

### Adicionando um Novo Componente React

1. Criar o componente em `frontend/src/components/`
2. Se for um nó do ReactFlow, registrar em `nodeTypes` no `App.tsx`
3. Importar e usar no componente pai

### Atualizando Dados do Neo4j

1. Executar o spider Scrapy para coletar dados atualizados
2. Processar os dados para o formato CSV do Neo4j
3. Importar os CSVs no banco

## Estrutura de Branches

Recomendação para organização de branches:

```
main            ← Produção
├── develop     ← Desenvolvimento
│   ├── feature/nome-da-feature
│   ├── fix/nome-do-bug
│   └── chore/nome-da-tarefa
```

## Obtendo Token TMDB

1. Criar conta em [themoviedb.org](https://www.themoviedb.org/)
2. Acessar **Settings → API**
3. Solicitar uma API key
4. Copiar o **API Read Access Token** (Bearer token)
5. Adicionar ao `.env` como `TMDB_API_TOKEN`

## Troubleshooting

### Erro de conexão com Neo4j

```
ServiceUnavailable: Unable to retrieve routing information
```

**Solução:** Verificar se o Neo4j está rodando e se as credenciais no `.env` estão corretas. Se usando AWS SSM, verificar se o túnel está ativo.

### Erro CORS no frontend

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solução:** Verificar se `FRONTEND_URL` no `.env` do backend corresponde à URL do frontend (incluindo porta).

### Imagens não carregam (TMDB)

**Solução:** Verificar se `TMDB_API_TOKEN` está configurado corretamente. Testar o token diretamente:

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  "https://api.themoviedb.org/3/search/person?query=Fernanda+Montenegro&language=pt-BR"
```

### Frontend não conecta ao backend

**Solução:** Verificar se `VITE_API_ENDPOINT` no `.env` do frontend aponta para a URL correta do backend. Reiniciar o Vite após alterar variáveis de ambiente.

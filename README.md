# Conecte os Globais

Um jogo interativo que desafia os jogadores a conectar dois atores através de suas participações em novelas, utilizando visualização de grafos interativa.

## 🎯 Sobre o Projeto

O "Conecte os Globais" é inspirado no conceito dos "Seis Graus de Separação", onde os jogadores devem encontrar conexões entre atores através das novelas que participaram. O jogo utiliza uma interface visual com grafos interativos, permitindo que o usuário construa o caminho entre dois atores selecionados aleatoriamente.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server
- **React Flow (@xyflow/react)** - Biblioteca para grafos interativos
- **Radix UI** - Componentes de interface acessíveis
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP para comunicação com a API

### Backend
- **FastAPI** - Framework web moderno para Python
- **Python 3.11+** - Linguagem de programação
- **Neo4j** - Banco de dados de grafos
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

## 📁 Estrutura do Projeto

```
conecte-os-globais/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── base-node.tsx      # Componente base para nós do grafo
│   │   │   ├── GraphNode.tsx      # Nó específico do jogo
│   │   │   ├── NewNode.tsx        # Nó placeholder
│   │   │   └── Modal.tsx          # Modal de resultado
│   │   ├── config/
│   │   │   └── env.ts            # Configurações de ambiente
│   │   ├── lib/
│   │   │   └── utils.ts          # Utilitários
│   │   ├── App.tsx               # Componente principal
│   │   └── main.tsx              # Ponto de entrada
│   ├── package.json
│   └── vite.config.ts
└── backend/
    ├── app/
    │   ├── api/v1/
    │   │   ├── endpoints.py      # Rotas da API
    │   │   └── api.py           # Configuração das rotas
    │   ├── core/
    │   │   └── config.py        # Configurações do backend
    │   ├── db/
    │   │   └── neo4j.py         # Conexão com Neo4j
    │   ├── models/              # Modelos Pydantic
    │   └── main.py             # Aplicação FastAPI
    ├── tests/                  # Testes automatizados
    ├── requirements.txt
    └── docker-compose.yml
```

## 🛠️ Como Executar

### Pré-requisitos

- **Node.js 18+** e npm/yarn
- **Python 3.11+** e pip
- **Neo4j** (local ou Docker)
- **Docker** (opcional, mas recomendado)

### Executando com Docker (Recomendado)

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd conecte-os-globais
```

2. Execute com Docker Compose:
```bash
docker-compose up --build
```

3. Acesse a aplicação:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Documentação da API: `http://localhost:8000/docs`

### Desenvolvimento Local

#### Backend

1. Navegue para o diretório do backend:
```bash
cd backend
```

2. Crie um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. Execute o servidor:
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. Navegue para o diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env com:
VITE_API_ENDPOINT=http://localhost:8000
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

## 🎮 Como Jogar

1. **Iniciar Jogo**: Clique no botão "Novo jogo" para gerar dois atores aleatórios
2. **Adicionar Conexões**: Clique nos nós "+" para adicionar novelas ou atores que conectem o caminho
3. **Completar Caminho**: Continue adicionando nós até conectar os dois atores iniciais
4. **Verificar Resultado**: O sistema automaticamente verifica se o caminho é válido
5. **Vitória**: Um modal aparecerá quando a conexão for encontrada com sucesso

## 📡 API Endpoints

### Atores
- `GET /api/v1/atores/random` - Retorna um ator aleatório
- `GET /api/v1/atores/{name}/novelas` - Lista novelas de um ator

### Novelas  
- `GET /api/v1/novelas/{name}/atores` - Lista atores de uma novela

### Jogo
- `POST /api/v1/graph/shortest_path` - Verifica se o caminho é válido

### Sistema
- `GET /api/v1/health` - Status da API

## 🗄️ Banco de Dados

O projeto utiliza **Neo4j** como banco de dados de grafos para armazenar:

- **Nós Ator**: Representam atores/atrizes
- **Nós Novela**: Representam novelas
- **Relacionamentos**: Conexões PARTICIPOU_DE entre atores e novelas

### Estrutura do Grafo
```
(Ator)-[:PARTICIPOU_DE]->(Novela)<-[:PARTICIPOU_DE]-(Ator)
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
NEO4J_URI="neo4j://localhost:56789"
NEO4J_AUTH_USER="user"
NEO4J_AUTH_PASSWORD="password"
TMDB_API_TOKEN="token"
FRONTEND_URL="http://localhost:5173"
```

#### Frontend (.env.local)
```env
VITE_APP_URL=http://localhost:8000
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.


## 🎯 Funcionalidades Futuras

- [ ] Sistema de pontuação baseado no número de conexões
- [ ] Modo multiplayer
- [ ] Diferentes categorias (filmes, séries, etc.)
- [ ] Sistema de dicas
- [ ] Histórico de jogadas
- [ ] Interface mobile otimizada

---

**🎭 Conecte os Globais** - Descubra as conexões do mundo artístico!

## Abrir conexão local com o Neo4j

*OBS:* Verificar se as credencials AWS estão corretas e respondendo antes de executar o comando

```
aws ssm start-session \
    --target i-xxxxxxxxxxx \
    --document-name AWS-StartPortForwardingSession \
    --parameters '{"portNumber":["7687"], "localPortNumber":["56789"]}'
```
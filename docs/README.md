# 📚 Documentação Técnica — Conecte os Globais

Bem-vindo à documentação técnica do projeto **Conecte os Globais**.

## Índice

| Documento | Descrição |
|-----------|-----------|
| [01 - Visão Geral](./01-visao-geral.md) | Introdução ao projeto, conceito do jogo e objetivos |
| [02 - Arquitetura](./02-arquitetura.md) | Arquitetura do sistema, diagrama de componentes e fluxo de dados |
| [03 - Backend](./03-backend.md) | API FastAPI, modelos, serviços e configuração |
| [04 - Frontend](./04-frontend.md) | Aplicação React, componentes, estado e estilização |
| [05 - Dados do Grafo](./05-banco-de-dados.md) | Dataset estático do grafo, geração a partir dos CSVs e consulta via Cytoscape |
| [06 - Web Scraping](./06-web-scraping.md) | Spider Scrapy, pipeline de coleta e processamento de dados |
| [07 - API Reference](./07-api-reference.md) | Referência completa dos endpoints da API REST |
| [08 - Deploy e Infraestrutura](./08-deploy-infraestrutura.md) | Docker, Docker Compose, variáveis de ambiente e AWS |
| [09 - Guia de Desenvolvimento](./09-guia-desenvolvimento.md) | Setup local, comandos úteis e fluxo de trabalho |

## Stack Tecnológica

```
Frontend:  React 19 · TypeScript · Vite · Cytoscape.js · Radix UI · Tailwind CSS
Backend:   FastAPI · Python 3.11+ · Pydantic · HTTPX
Grafo:     Dataset estático (graph.json) consultado por Cytoscape headless no frontend
Scraping:  Scrapy
Imagens:   TMDB API
Deploy:    Docker · Docker Compose · AWS
```

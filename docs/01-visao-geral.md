# 01 — Visão Geral do Projeto

## O que é o Conecte os Globais?

O **Conecte os Globais** é um jogo interativo inspirado no conceito dos **Seis Graus de Separação**. O jogador recebe dois atores brasileiros selecionados aleatoriamente e deve encontrar um caminho de conexão entre eles, alternando entre novelas e atores que participaram dessas novelas.

O jogo utiliza uma interface visual com **grafos interativos**, onde cada nó representa um ator ou uma novela, e as arestas representam participações.

## Conceito do Jogo

```
Ator A ──participou──▶ Novela X ◀──participou── Ator B ──participou──▶ Novela Y ◀──participou── Ator C
```

O jogador precisa construir esse caminho manualmente, escolhendo novelas e atores a cada passo, até que os dois atores iniciais estejam conectados.

## Fluxo do Jogo

1. O jogador clica em **"Novo Jogo"**
2. Dois atores aleatórios são sorteados e exibidos como nós no grafo
3. O jogador clica em um ator para ver as novelas em que ele participou
4. Ao selecionar uma novela, ela é adicionada ao grafo como um novo nó
5. O jogador clica na novela para ver os atores que participaram dela
6. O processo se repete até que os dois atores iniciais estejam conectados
7. A cada adição de nó, o sistema verifica automaticamente se existe um caminho válido
8. Quando o caminho é encontrado, um modal de vitória é exibido com o grau de separação

## Objetivos Técnicos

- Demonstrar o uso de **banco de dados de grafos** (Neo4j) para modelar relações entre entidades
- Criar uma interface interativa com **visualização de grafos** usando React Flow
- Integrar com a **API do TMDB** para enriquecer os dados com imagens de atores e novelas
- Coletar dados reais do site **Memória Globo** usando web scraping com Scrapy
- Oferecer uma experiência de jogo fluida com verificação automática de caminhos

## Público-Alvo

Fãs de novelas brasileiras e entusiastas de jogos de trivia/conexão que queiram testar seus conhecimentos sobre o elenco das novelas da Globo.

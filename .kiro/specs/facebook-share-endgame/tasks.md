# Tarefas de Implementação — Compartilhar Resultado no Facebook

## Tarefa 1: Instalar dependência fast-check

- [x] 1.1 Adicionar `fast-check` como dependência de desenvolvimento no `frontend/package.json`
- [x] 1.2 Executar `npm install` para instalar a dependência

## Tarefa 2: Criar módulo utilitário `lib/facebook-share.ts`

- [x] 2.1 Criar o arquivo `frontend/src/lib/facebook-share.ts` com a interface `GameNode` e a constante `GAME_URL`
- [x] 2.2 Implementar a função `generateSummaryText(nodes: GameNode[]): string` que gera o texto de resumo do resultado do jogo no formato "Conectei [Ator A] ao [Ator B] em [N] passo(s): [A] → [X] → ... → [B]", tratando singular/plural corretamente
- [x] 2.3 Implementar a função `buildFacebookShareUrl(quote: string, shareUrl: string): string` que constrói a URL completa do Facebook Share Dialog com parâmetros `u` e `quote` codificados via `encodeURIComponent`

## Tarefa 3: Adicionar meta tags Open Graph ao `index.html`

- [x] 3.1 Adicionar as meta tags `og:title`, `og:description`, `og:image`, `og:url` e `og:type` no `<head>` do `frontend/index.html`

## Tarefa 4: Modificar o componente `ModalEndGame`

- [x] 4.1 Importar `generateSummaryText`, `buildFacebookShareUrl` e `GAME_URL` de `lib/facebook-share.ts` no componente `ModalEndGame`
- [x] 4.2 Adicionar o botão "Compartilhar no Facebook" ao lado do botão "Fechar", renderizado condicionalmente apenas quando `graph?.found === true` e `graph?.nodes?.length >= 3`
- [x] 4.3 Implementar o handler `handleShare` que gera o texto de resumo, constrói a URL e abre o Facebook Share Dialog via `window.open` com dimensões `width=600, height=400`

## Tarefa 5: Escrever testes para o módulo `lib/facebook-share.ts`

- [x] 5.1 Criar o arquivo `frontend/src/tests/lib/facebook-share.test.ts`
- [x] 5.2 Escrever testes unitários para `generateSummaryText`: caso com 3 nós (singular "1 passo"), caso com 5+ nós (plural "N passos"), verificação de formato e ordem dos nós
- [x] 5.3 Escrever testes unitários para `buildFacebookShareUrl`: verificar que a URL contém a base correta, parâmetro `u` e parâmetro `quote`
- [x] 5.4 (**PBT**) Escrever teste de propriedade para `generateSummaryText` — *Para qualquer* caminho de jogo válido, o texto gerado deve conter todos os nomes dos nós na ordem correta, o número correto de passos, e usar singular/plural adequadamente (mínimo 100 iterações) `[Feature: facebook-share-endgame, Property 1]`
- [x] 5.5 (**PBT**) Escrever teste de propriedade round-trip para `buildFacebookShareUrl` — *Para qualquer* texto de resumo válido, construir a URL e depois decodificar os parâmetros deve produzir os valores originais (mínimo 100 iterações) `[Feature: facebook-share-endgame, Property 2]`

## Tarefa 6: Escrever testes para o componente `ModalEndGame` (compartilhamento)

- [x] 6.1 Adicionar teste: botão "Compartilhar no Facebook" é renderizado quando `graph.found === true` e `graph.nodes` tem 3+ elementos
- [x] 6.2 Adicionar teste: botão "Compartilhar no Facebook" NÃO é renderizado quando `graph.found === false` ou `graph.nodes` é inválido
- [x] 6.3 Adicionar teste: clique no botão chama `window.open` com a URL correta do Facebook Share Dialog

## Tarefa 7: Verificação final

- [x] 7.1 Executar `npm run test` no diretório `frontend/` e garantir que todos os testes passam
- [x] 7.2 Executar `npm run build` no diretório `frontend/` e garantir que o build compila sem erros

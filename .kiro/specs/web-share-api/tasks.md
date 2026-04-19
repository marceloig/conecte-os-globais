# Tasks — Web Share API para Compartilhamento de Resultados

## Task 1: Criar módulo `lib/share.ts`

- [x] 1.1 Criar `frontend/src/lib/share.ts` com `GameNode`, `GAME_URL` e `generateSummaryText` preservados de `facebook-share.ts`
- [x] 1.2 Implementar `buildShareText(summaryText, url)` que retorna `"{summaryText}\n{url}"`
- [x] 1.3 Implementar `isWebShareSupported()` que verifica se `navigator.share` está disponível e é uma função
- [x] 1.4 Implementar tipo `ShareResultOutcome` e função `shareResult(nodes)` com lógica de Web Share API, fallback para clipboard, e tratamento de AbortError
- [x] 1.5 Remover `frontend/src/lib/facebook-share.ts`

## Task 2: Atualizar `ModalEndGame.tsx`

- [x] 2.1 Atualizar imports de `facebook-share` para `share` no `ModalEndGame.tsx`
- [x] 2.2 Substituir `handleShare` síncrono por handler assíncrono usando `shareResult`, com estados `isSharing` e `copyFeedback`
- [x] 2.3 Atualizar botão: texto "Compartilhar" (ou "Copiado!" durante feedback), `disabled` durante compartilhamento

## Task 3: Criar testes do módulo `lib/share.ts`

- [x] 3.1 Criar `frontend/src/tests/lib/share.test.ts` com testes unitários de `generateSummaryText` (migrados de `facebook-share.test.ts`)
- [x] 3.2 Adicionar testes unitários de `buildShareText` (formato correto, concatenação)
- [x] 3.3 Adicionar testes unitários de `isWebShareSupported` (presente → true, ausente → false, navigator undefined → false)
- [x] 3.4 Adicionar testes unitários de `shareResult` (Web Share sucesso, AbortError silencioso, erro genérico → fallback clipboard, clipboard sucesso, clipboard falha)
- [x] 3.5 [PBT] Implementar Property 1: generateSummaryText preserva informações do caminho (migrar de facebook-share.test.ts com imports atualizados)
- [x] 3.6 [PBT] Implementar Property 2: buildShareText round-trip (composição/decomposição)
- [x] 3.7 Remover `frontend/src/tests/lib/facebook-share.test.ts`

## Task 4: Atualizar testes do `ModalEndGame.test.tsx`

- [x] 4.1 Atualizar testes existentes: trocar "Compartilhar no Facebook" por "Compartilhar" e remover verificações de `window.open` com URL do Facebook
- [x] 4.2 Adicionar teste de botão desabilitado durante compartilhamento (`isSharing`)
- [x] 4.3 Adicionar teste de feedback "Copiado!" exibido por 2 segundos após cópia para clipboard

## Task 5: Verificação final

- [x] 5.1 Executar `npm run test` no frontend e garantir que todos os testes passam
- [x] 5.2 Executar `npm run build` no frontend e garantir que o build compila sem erros

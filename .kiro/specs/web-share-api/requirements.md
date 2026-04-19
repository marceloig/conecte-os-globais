# Documento de Requisitos — Web Share API para Compartilhamento de Resultados

## Introdução

Esta funcionalidade substitui a abordagem atual de compartilhamento via Facebook Share Dialog (`sharer.php`) pela Web Share API (`navigator.share`). A motivação é que o Facebook descontinuou o parâmetro `quote` do `sharer.php`, fazendo com que o texto de resumo do jogo não apareça no post — apenas o card de pré-visualização do link é exibido. A Web Share API resolve esse problema ao permitir compartilhar texto + URL para qualquer aplicativo que o usuário escolher (Facebook, WhatsApp, Twitter, etc.), funciona especialmente bem em dispositivos móveis, e não requer dependências externas nem App IDs. Quando a Web Share API não está disponível no navegador, o sistema oferece um fallback de copiar para a área de transferência.

## Glossário

- **ModalEndGame**: Componente React que exibe o resultado do jogo quando o jogador vence, mostrando o caminho encontrado entre os atores.
- **Web_Share_API**: API nativa do navegador (`navigator.share`) que permite compartilhar texto, URLs e arquivos com aplicativos instalados no dispositivo do usuário, sem dependências externas.
- **Texto_de_Resumo**: Texto descritivo do resultado do jogo contendo os atores inicial e final e a cadeia de atores e novelas que os conecta (ex: "Conectei Ator A ao Ator B em 3 passos: Ator A → Novela X → Ator C → Novela Y → Ator B").
- **Clipboard_API**: API nativa do navegador (`navigator.clipboard.writeText`) que permite copiar texto para a área de transferência do usuário.
- **Botão_Compartilhar**: Botão na interface do ModalEndGame que aciona o compartilhamento do resultado do jogo.
- **Caminho_do_Jogo**: Sequência ordenada de nós (atores e novelas) que conecta os dois atores iniciais do jogo.
- **Domínio_do_Jogo**: URL base do jogo: `https://conecteosglobais.igormarcelo.dev.br/`.
- **GameNode**: Interface TypeScript que representa um nó no Caminho_do_Jogo, contendo `name` (string) e `type` ("ator" | "novela").
- **Share_Module**: Módulo utilitário TypeScript (`lib/share.ts`) que contém as funções puras de geração de texto e compartilhamento.

## Requisitos

### Requisito 1: Gerar Texto de Resumo do Resultado

**User Story:** Como jogador, eu quero que o resultado do meu jogo seja resumido em um texto descritivo, para que eu possa compartilhar minha conquista de forma clara.

#### Critérios de Aceitação

1. WHEN o ModalEndGame é aberto com um resultado de jogo válido, THE Share_Module SHALL gerar o Texto_de_Resumo no formato: "Conectei [Ator Inicial] ao [Ator Final] em [N] passo(s): [Ator A] → [Novela X] → [Ator C] → ... → [Ator B]", onde [N] é o número de passos calculado como `(número de nós - 1) / 2`.
2. WHEN o Caminho_do_Jogo contém exatamente 3 nós (ator → novela → ator), THE Share_Module SHALL indicar "1 passo" (singular) no Texto_de_Resumo.
3. WHEN o Caminho_do_Jogo contém mais de 3 nós, THE Share_Module SHALL indicar o número correto de passos no plural (ex: "2 passos", "3 passos").

### Requisito 2: Compartilhar via Web Share API

**User Story:** Como jogador, eu quero compartilhar meu resultado do jogo usando o menu de compartilhamento nativo do meu dispositivo, para que eu possa enviar para qualquer aplicativo (WhatsApp, Facebook, Twitter, etc.).

#### Critérios de Aceitação

1. WHEN o jogador clica no Botão_Compartilhar e a Web_Share_API está disponível no navegador, THE Share_Module SHALL invocar `navigator.share` com o Texto_de_Resumo como parâmetro `text` e o Domínio_do_Jogo como parâmetro `url`.
2. WHEN o jogador clica no Botão_Compartilhar e a Web_Share_API está disponível no navegador, THE Share_Module SHALL incluir "Conecte os Globais" como parâmetro `title` na chamada a `navigator.share`.
3. IF o jogador cancela o diálogo de compartilhamento nativo (AbortError), THEN THE Share_Module SHALL tratar o cancelamento silenciosamente sem exibir mensagens de erro ao jogador.
4. IF a chamada a `navigator.share` falha com um erro diferente de AbortError, THEN THE Share_Module SHALL executar o fallback de copiar para a área de transferência.

### Requisito 3: Fallback — Copiar para Área de Transferência

**User Story:** Como jogador usando um navegador que não suporta a Web Share API, eu quero copiar o resultado do jogo para a área de transferência, para que eu possa colá-lo manualmente onde desejar.

#### Critérios de Aceitação

1. WHEN o jogador clica no Botão_Compartilhar e a Web_Share_API não está disponível no navegador, THE Share_Module SHALL copiar o Texto_de_Resumo seguido do Domínio_do_Jogo para a área de transferência usando a Clipboard_API.
2. WHEN o texto é copiado com sucesso para a área de transferência, THE ModalEndGame SHALL exibir uma confirmação visual temporária indicando que o texto foi copiado (ex: alterar o texto do botão para "Copiado!" por 2 segundos).
3. IF a Clipboard_API falha ao copiar o texto, THEN THE ModalEndGame SHALL exibir uma mensagem de erro informando que não foi possível copiar o texto.

### Requisito 4: Detecção de Suporte à Web Share API

**User Story:** Como desenvolvedor, eu quero que o sistema detecte automaticamente se o navegador suporta a Web Share API, para que o comportamento correto (compartilhamento nativo ou fallback) seja selecionado.

#### Critérios de Aceitação

1. THE Share_Module SHALL expor uma função que verifica se `navigator.share` está disponível e é uma função no ambiente atual.
2. WHEN a função de detecção é chamada em um ambiente onde `navigator.share` existe e é uma função, THE função SHALL retornar `true`.
3. WHEN a função de detecção é chamada em um ambiente onde `navigator.share` não existe ou `navigator` não está definido, THE função SHALL retornar `false`.

### Requisito 5: Botão de Compartilhar no ModalEndGame

**User Story:** Como jogador, eu quero ver um botão de compartilhar no modal de fim de jogo, para que eu possa compartilhar meu resultado facilmente.

#### Critérios de Aceitação

1. WHEN o ModalEndGame é exibido com um resultado de jogo válido (`graph.found === true` e `graph.nodes.length >= 3`), THE ModalEndGame SHALL renderizar o Botão_Compartilhar com o texto "Compartilhar".
2. WHEN o ModalEndGame é exibido sem um resultado de jogo válido, THE Botão_Compartilhar SHALL permanecer oculto.
3. WHILE o compartilhamento via Web_Share_API ou Clipboard_API está em andamento, THE Botão_Compartilhar SHALL permanecer desabilitado para evitar múltiplas invocações simultâneas.

### Requisito 6: Remoção da Dependência do Facebook Share Dialog

**User Story:** Como desenvolvedor, eu quero remover o código específico do Facebook Share Dialog, para que a base de código não contenha lógica obsoleta.

#### Critérios de Aceitação

1. THE Share_Module SHALL substituir o módulo `lib/facebook-share.ts`, removendo a função `buildFacebookShareUrl` e a dependência do endpoint `sharer.php` do Facebook.
2. THE Share_Module SHALL preservar a função `generateSummaryText` e a interface `GameNode` do módulo anterior, mantendo compatibilidade com o código existente.
3. THE Share_Module SHALL preservar a constante `GAME_URL` do módulo anterior.

### Requisito 7: Construção do Texto de Compartilhamento

**User Story:** Como desenvolvedor, eu quero que a lógica de construção do texto completo de compartilhamento esteja isolada em uma função utilitária pura, para que seja testável e reutilizável.

#### Critérios de Aceitação

1. THE Share_Module SHALL expor uma função que recebe o Texto_de_Resumo e o Domínio_do_Jogo e retorna o texto completo de compartilhamento no formato: "[Texto_de_Resumo]\n[Domínio_do_Jogo]".
2. FOR ALL Textos_de_Resumo válidos e URLs válidas, construir o texto de compartilhamento e depois extrair as partes SHALL produzir os valores originais (propriedade round-trip de composição/decomposição).

### Requisito 8: Testes

**User Story:** Como desenvolvedor, eu quero que todas as mudanças tenham cobertura de testes, para garantir a qualidade e evitar regressões.

#### Critérios de Aceitação

1. THE suíte de testes do frontend SHALL conter testes para a geração do Texto_de_Resumo a partir do Caminho_do_Jogo, incluindo singular/plural.
2. THE suíte de testes do frontend SHALL conter testes para a função de detecção de suporte à Web_Share_API.
3. THE suíte de testes do frontend SHALL conter testes para o fluxo de compartilhamento via Web_Share_API (mock de `navigator.share`).
4. THE suíte de testes do frontend SHALL conter testes para o fallback de copiar para a área de transferência quando a Web_Share_API não está disponível.
5. THE suíte de testes do frontend SHALL conter testes para o tratamento de erros (AbortError silencioso, fallback em caso de erro genérico).
6. THE suíte de testes do frontend SHALL conter testes para a renderização condicional do Botão_Compartilhar no ModalEndGame.
7. THE suíte de testes do frontend SHALL conter testes para o estado desabilitado do Botão_Compartilhar durante o compartilhamento.
8. THE suíte de testes do frontend SHALL atualizar os testes existentes em `ModalEndGame.test.tsx` para refletir o novo texto do botão ("Compartilhar" em vez de "Compartilhar no Facebook") e o novo comportamento de compartilhamento.

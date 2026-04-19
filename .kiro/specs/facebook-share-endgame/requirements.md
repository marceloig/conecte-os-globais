# Documento de Requisitos — Compartilhar Resultado no Facebook

## Introdução

Esta funcionalidade permite que o jogador compartilhe o resultado do jogo no Facebook ao finalizar uma partida com sucesso. O compartilhamento utiliza o Facebook Share Dialog, que não requer autenticação OAuth no aplicativo. O botão de compartilhamento é exibido exclusivamente no componente `ModalEndGame`. O conteúdo compartilhado inclui um resumo textual do caminho encontrado entre os atores e um link para o jogo com meta tags Open Graph para gerar um card de pré-visualização no Facebook.

## Glossário

- **ModalEndGame**: Componente React que exibe o resultado do jogo quando o jogador vence, mostrando o caminho encontrado entre os atores.
- **Facebook_Share_Dialog**: Janela pop-up do Facebook que permite ao usuário compartilhar conteúdo sem necessidade de autenticação OAuth no aplicativo. Acessada via URL `https://www.facebook.com/sharer/sharer.php`.
- **Texto_de_Resumo**: Texto descritivo do resultado do jogo contendo os atores iniciais e a cadeia de atores e novelas que os conecta (ex: "Conectei Ator A ao Ator B em 3 passos: Ator A → Novela X → Ator C → Novela Y → Ator B").
- **Open_Graph_Meta_Tags**: Meta tags HTML no padrão Open Graph Protocol (`og:title`, `og:description`, `og:image`, `og:url`) que permitem ao Facebook renderizar um card de pré-visualização ao compartilhar um link.
- **Caminho_do_Jogo**: Sequência ordenada de nós (atores e novelas) que conecta os dois atores iniciais do jogo.
- **Botão_Compartilhar**: Botão na interface do ModalEndGame que aciona o compartilhamento no Facebook.
- **Domínio_do_Jogo**: URL base do jogo: `https://conecteosglobais.igormarcelo.dev.br/`.

## Requisitos

### Requisito 1: Gerar Texto de Resumo do Resultado

**User Story:** Como jogador, eu quero que o resultado do meu jogo seja resumido em um texto descritivo, para que eu possa compartilhar minha conquista de forma clara.

#### Critérios de Aceitação

1. WHEN o ModalEndGame é aberto com um resultado de jogo válido, THE Texto_de_Resumo SHALL ser gerado no formato: "Conectei [Ator Inicial A] ao [Ator Inicial B] em [N] passos: [Ator A] → [Novela X] → [Ator C] → ... → [Ator B]", onde [N] é o número de passos (arestas) no Caminho_do_Jogo.
2. WHEN o Caminho_do_Jogo contém exatamente 3 nós (ator → novela → ator), THE Texto_de_Resumo SHALL indicar "1 passo" (singular) em vez de "passos" (plural).
3. WHEN o Caminho_do_Jogo contém mais de 3 nós, THE Texto_de_Resumo SHALL indicar o número correto de passos no plural (ex: "3 passos").

### Requisito 2: Botão de Compartilhar no Facebook

**User Story:** Como jogador, eu quero ver um botão "Compartilhar no Facebook" no modal de fim de jogo, para que eu possa compartilhar meu resultado facilmente.

#### Critérios de Aceitação

1. WHEN o ModalEndGame é exibido com um resultado de jogo válido, THE Botão_Compartilhar SHALL ser renderizado dentro do ModalEndGame com o texto "Compartilhar no Facebook".
2. WHEN o ModalEndGame é exibido sem um resultado de jogo válido, THE Botão_Compartilhar SHALL permanecer oculto.
3. THE Botão_Compartilhar SHALL ser exibido exclusivamente no componente ModalEndGame e em nenhum outro local da aplicação.

### Requisito 3: Abrir o Facebook Share Dialog

**User Story:** Como jogador, eu quero que ao clicar no botão de compartilhar, o Facebook Share Dialog seja aberto, para que eu possa publicar meu resultado na minha timeline.

#### Critérios de Aceitação

1. WHEN o jogador clica no Botão_Compartilhar, THE ModalEndGame SHALL abrir uma nova janela do navegador (popup) com o Facebook_Share_Dialog.
2. WHEN o Facebook_Share_Dialog é aberto, THE URL da janela SHALL conter o parâmetro `u` com o valor do Domínio_do_Jogo (`https://conecteosglobais.igormarcelo.dev.br/`).
3. WHEN o Facebook_Share_Dialog é aberto, THE URL da janela SHALL conter o parâmetro `quote` com o valor do Texto_de_Resumo gerado para o resultado atual do jogo.

### Requisito 4: Meta Tags Open Graph

**User Story:** Como jogador, eu quero que o link compartilhado no Facebook exiba um card de pré-visualização atrativo, para que meus amigos entendam do que se trata o jogo.

#### Critérios de Aceitação

1. THE página HTML principal (`index.html`) SHALL conter a meta tag `og:title` com o valor "Conecte os Globais".
2. THE página HTML principal (`index.html`) SHALL conter a meta tag `og:description` com uma descrição do jogo (ex: "Conecte atores da Globo através de suas novelas! Um jogo inspirado nos Seis Graus de Separação.").
3. THE página HTML principal (`index.html`) SHALL conter a meta tag `og:image` com a URL de uma imagem representativa do jogo.
4. THE página HTML principal (`index.html`) SHALL conter a meta tag `og:url` com o valor do Domínio_do_Jogo.
5. THE página HTML principal (`index.html`) SHALL conter a meta tag `og:type` com o valor "website".

### Requisito 5: Função Utilitária de Compartilhamento

**User Story:** Como desenvolvedor, eu quero que a lógica de construção da URL de compartilhamento do Facebook esteja isolada em uma função utilitária, para que seja testável e reutilizável.

#### Critérios de Aceitação

1. THE função utilitária de compartilhamento SHALL receber o Texto_de_Resumo e a URL de compartilhamento como parâmetros e retornar a URL completa do Facebook_Share_Dialog.
2. THE função utilitária de compartilhamento SHALL codificar corretamente (URL-encode) todos os parâmetros na URL gerada.
3. WHEN a função utilitária recebe caracteres especiais no Texto_de_Resumo (acentos, emojis, setas "→"), THE função SHALL codificá-los corretamente na URL resultante.
4. FOR ALL Textos_de_Resumo válidos, construir a URL e depois decodificar os parâmetros SHALL produzir os valores originais (propriedade round-trip de codificação/decodificação de URL).

### Requisito 6: Testes Unitários

**User Story:** Como desenvolvedor, eu quero que todas as mudanças tenham cobertura de testes, para garantir a qualidade e evitar regressões.

#### Critérios de Aceitação

1. THE suíte de testes do frontend SHALL conter testes para a renderização do Botão_Compartilhar no ModalEndGame.
2. THE suíte de testes do frontend SHALL conter testes para a geração do Texto_de_Resumo a partir do Caminho_do_Jogo.
3. THE suíte de testes do frontend SHALL conter testes para a construção da URL do Facebook_Share_Dialog pela função utilitária.
4. THE suíte de testes do frontend SHALL conter testes para o comportamento de clique no Botão_Compartilhar (verificando que `window.open` é chamado com a URL correta).
5. THE suíte de testes do frontend SHALL verificar que o Botão_Compartilhar permanece oculto quando o resultado do jogo é inválido ou ausente.

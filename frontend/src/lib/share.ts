export interface GameNode {
  name: string;
  type: "ator" | "novela";
}

export const GAME_URL = "https://conecteosglobais.igormarcelo.dev.br/";

/**
 * Gera o texto de resumo do resultado do jogo.
 *
 * Formato: "Conectei [Ator A] ao [Ator B] em [N] passo(s): [A] → [X] → ... → [B]"
 * Usa "passo" (singular) quando N === 1, "passos" (plural) caso contrário.
 */
export function generateSummaryText(nodes: GameNode[]): string {
  const firstActor = nodes[0].name;
  const lastActor = nodes[nodes.length - 1].name;
  const steps = (nodes.length - 1) / 2;
  const stepWord = steps === 1 ? "passo" : "passos";
  const path = nodes.map((node) => node.name).join(" → ");

  return `Conectei ${firstActor} ao ${lastActor} em ${steps} ${stepWord}: ${path}`;
}

/**
 * Função pura que concatena o texto de resumo e a URL no formato:
 * "{summaryText}\n{url}"
 */
export function buildShareText(summaryText: string, url: string): string {
  return `${summaryText}\n${url}`;
}

/**
 * Verifica se `navigator.share` está disponível e é uma função.
 * Retorna `false` quando `navigator` não está definido (SSR).
 */
export function isWebShareSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  );
}

export type ShareResultOutcome =
  | { status: "shared" }
  | { status: "copied" }
  | { status: "error"; message: string };

/**
 * Função assíncrona que orquestra o fluxo de compartilhamento:
 *
 * 1. Gera o texto de resumo via `generateSummaryText(nodes)`.
 * 2. Se Web Share API disponível:
 *    - Chama `navigator.share({ title, text, url })`.
 *    - Sucesso → `{ status: "shared" }`.
 *    - AbortError → `{ status: "shared" }` (cancelamento silencioso).
 *    - Outro erro → fallback para clipboard.
 * 3. Se Web Share API não disponível → fallback para clipboard:
 *    - `clipboard.writeText` sucesso → `{ status: "copied" }`.
 *    - `clipboard.writeText` falha → `{ status: "error", message: "..." }`.
 */
export async function shareResult(
  nodes: GameNode[],
): Promise<ShareResultOutcome> {
  const summaryText = generateSummaryText(nodes);

  if (isWebShareSupported()) {
    try {
      await navigator.share({
        title: "Conecte os Globais",
        text: summaryText,
        url: GAME_URL,
      });
      return { status: "shared" };
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return { status: "shared" };
      }
      // Fallback para clipboard em caso de outro erro
    }
  }

  // Fallback: copiar para área de transferência
  try {
    await navigator.clipboard.writeText(
      buildShareText(summaryText, GAME_URL),
    );
    return { status: "copied" };
  } catch {
    return { status: "error", message: "Não foi possível copiar o texto." };
  }
}

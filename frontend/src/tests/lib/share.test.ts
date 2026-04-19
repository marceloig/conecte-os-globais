import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import {
  generateSummaryText,
  buildShareText,
  isWebShareSupported,
  shareResult,
  GAME_URL,
  type GameNode,
} from "@/lib/share";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a valid game path with alternating ator/novela nodes.
 * Result always has (2 * steps + 1) nodes, starting and ending with "ator".
 */
function makePath(actorNames: string[], novelaNames: string[]): GameNode[] {
  const nodes: GameNode[] = [];
  for (let i = 0; i < actorNames.length; i++) {
    nodes.push({ name: actorNames[i], type: "ator" });
    if (i < novelaNames.length) {
      nodes.push({ name: novelaNames[i], type: "novela" });
    }
  }
  return nodes;
}

/** Escape special regex characters in a string */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Unit tests for generateSummaryText (migrated from facebook-share.test.ts)
// ---------------------------------------------------------------------------

describe("generateSummaryText", () => {
  it('uses singular "passo" when path has exactly 3 nodes (1 step)', () => {
    const nodes: GameNode[] = [
      { name: "Fernanda Montenegro", type: "ator" },
      { name: "Avenida Brasil", type: "novela" },
      { name: "Cauã Reymond", type: "ator" },
    ];

    const result = generateSummaryText(nodes);

    expect(result).toBe(
      "Conectei Fernanda Montenegro ao Cauã Reymond em 1 passo: Fernanda Montenegro → Avenida Brasil → Cauã Reymond"
    );
  });

  it('uses plural "passos" when path has 5 nodes (2 steps)', () => {
    const nodes: GameNode[] = [
      { name: "Ator A", type: "ator" },
      { name: "Novela X", type: "novela" },
      { name: "Ator B", type: "ator" },
      { name: "Novela Y", type: "novela" },
      { name: "Ator C", type: "ator" },
    ];

    const result = generateSummaryText(nodes);

    expect(result).toBe(
      "Conectei Ator A ao Ator C em 2 passos: Ator A → Novela X → Ator B → Novela Y → Ator C"
    );
  });

  it('uses plural "passos" when path has 7 nodes (3 steps)', () => {
    const nodes: GameNode[] = [
      { name: "A1", type: "ator" },
      { name: "N1", type: "novela" },
      { name: "A2", type: "ator" },
      { name: "N2", type: "novela" },
      { name: "A3", type: "ator" },
      { name: "N3", type: "novela" },
      { name: "A4", type: "ator" },
    ];

    const result = generateSummaryText(nodes);

    expect(result).toBe(
      "Conectei A1 ao A4 em 3 passos: A1 → N1 → A2 → N2 → A3 → N3 → A4"
    );
  });

  it("includes all node names in the correct order separated by →", () => {
    const nodes: GameNode[] = [
      { name: "Primeiro", type: "ator" },
      { name: "Meio", type: "novela" },
      { name: "Último", type: "ator" },
    ];

    const result = generateSummaryText(nodes);

    expect(result).toContain("Primeiro → Meio → Último");
  });

  it("starts with the first actor and ends with the last actor", () => {
    const nodes: GameNode[] = [
      { name: "Tony Ramos", type: "ator" },
      { name: "Mulheres de Areia", type: "novela" },
      { name: "Glória Pires", type: "ator" },
    ];

    const result = generateSummaryText(nodes);

    expect(result).toMatch(/^Conectei Tony Ramos ao Glória Pires/);
  });
});

// ---------------------------------------------------------------------------
// Unit tests for buildShareText
// ---------------------------------------------------------------------------

describe("buildShareText", () => {
  it("returns summaryText followed by newline and url", () => {
    const summary = "Conectei A ao B em 1 passo: A → X → B";
    const url = "https://example.com";

    const result = buildShareText(summary, url);

    expect(result).toBe(`${summary}\n${url}`);
  });

  it("concatenates correctly with real game data", () => {
    const summary =
      "Conectei Fernanda Montenegro ao Cauã Reymond em 1 passo: Fernanda Montenegro → Avenida Brasil → Cauã Reymond";
    const url = GAME_URL;

    const result = buildShareText(summary, url);

    expect(result).toBe(`${summary}\n${url}`);
    const parts = result.split("\n");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBe(summary);
    expect(parts[1]).toBe(url);
  });
});

// ---------------------------------------------------------------------------
// Unit tests for isWebShareSupported
// ---------------------------------------------------------------------------

describe("isWebShareSupported", () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    // Restore navigator after each test
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("returns true when navigator.share is a function", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { share: vi.fn() },
      writable: true,
      configurable: true,
    });

    expect(isWebShareSupported()).toBe(true);
  });

  it("returns false when navigator.share is absent", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    expect(isWebShareSupported()).toBe(false);
  });

  it("returns false when navigator is undefined", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(isWebShareSupported()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unit tests for shareResult
// ---------------------------------------------------------------------------

describe("shareResult", () => {
  const sampleNodes: GameNode[] = [
    { name: "Ator A", type: "ator" },
    { name: "Novela X", type: "novela" },
    { name: "Ator B", type: "ator" },
  ];

  let originalNavigator: Navigator;

  beforeEach(() => {
    originalNavigator = globalThis.navigator;
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('returns { status: "shared" } when navigator.share succeeds', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { share: shareMock, clipboard: { writeText: vi.fn() } },
      writable: true,
      configurable: true,
    });

    const result = await shareResult(sampleNodes);

    expect(result).toEqual({ status: "shared" });
    expect(shareMock).toHaveBeenCalledWith({
      title: "Conecte os Globais",
      text: expect.stringContaining("Conectei Ator A ao Ator B"),
      url: GAME_URL,
    });
  });

  it('returns { status: "shared" } when navigator.share rejects with AbortError', async () => {
    const abortError = new DOMException("User cancelled", "AbortError");
    const shareMock = vi.fn().mockRejectedValue(abortError);
    Object.defineProperty(globalThis, "navigator", {
      value: { share: shareMock, clipboard: { writeText: vi.fn() } },
      writable: true,
      configurable: true,
    });

    const result = await shareResult(sampleNodes);

    expect(result).toEqual({ status: "shared" });
  });

  it("falls back to clipboard when navigator.share rejects with a generic error", async () => {
    const genericError = new Error("Something went wrong");
    const shareMock = vi.fn().mockRejectedValue(genericError);
    const clipboardMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { share: shareMock, clipboard: { writeText: clipboardMock } },
      writable: true,
      configurable: true,
    });

    const result = await shareResult(sampleNodes);

    expect(result).toEqual({ status: "copied" });
    expect(clipboardMock).toHaveBeenCalled();
  });

  it('returns { status: "copied" } when navigator.share is unavailable and clipboard succeeds', async () => {
    const clipboardMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { clipboard: { writeText: clipboardMock } },
      writable: true,
      configurable: true,
    });

    const result = await shareResult(sampleNodes);

    expect(result).toEqual({ status: "copied" });
    expect(clipboardMock).toHaveBeenCalledWith(
      expect.stringContaining("Conectei Ator A ao Ator B")
    );
  });

  it('returns { status: "error" } when clipboard.writeText fails', async () => {
    const clipboardMock = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard failed"));
    Object.defineProperty(globalThis, "navigator", {
      value: { clipboard: { writeText: clipboardMock } },
      writable: true,
      configurable: true,
    });

    const result = await shareResult(sampleNodes);

    expect(result).toEqual({
      status: "error",
      message: "Não foi possível copiar o texto.",
    });
  });
});

// ---------------------------------------------------------------------------
// PBT: Property 1 — generateSummaryText preserves path information
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 1.1, 1.2, 1.3**
 *
 * Arbitrary that generates a valid game path: alternating ator/novela nodes,
 * minimum 3 nodes (1 step), always starting and ending with "ator".
 */
const validGamePathArb = fc
  .integer({ min: 1, max: 20 })
  .chain((steps) =>
    fc.tuple(
      fc.array(
        fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => !s.includes("→")),
        { minLength: steps + 1, maxLength: steps + 1 }
      ),
      fc.array(
        fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => !s.includes("→")),
        { minLength: steps, maxLength: steps }
      )
    )
  )
  .map(([actorNames, novelaNames]) => makePath(actorNames, novelaNames));

describe("Property 1: generateSummaryText preserves path information", () => {
  it("for any valid game path, the summary text contains all node names in order, correct step count, and proper singular/plural", () => {
    fc.assert(
      fc.property(validGamePathArb, (nodes) => {
        const result = generateSummaryText(nodes);
        const steps = (nodes.length - 1) / 2;

        // 1. Contains all node names in the correct order separated by " → "
        const expectedPath = nodes.map((n) => n.name).join(" → ");
        expect(result).toContain(expectedPath);

        // 2. Contains the correct step count
        expect(result).toContain(`em ${steps} `);

        // 3. Uses singular/plural correctly
        if (steps === 1) {
          expect(result).toContain("1 passo:");
          expect(result).not.toContain("1 passos");
        } else {
          expect(result).toContain(`${steps} passos:`);
        }

        // 4. Starts with first actor and references last actor
        expect(result).toMatch(
          new RegExp(
            `^Conectei ${escapeRegex(nodes[0].name)} ao ${escapeRegex(nodes[nodes.length - 1].name)}`
          )
        );
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// PBT: Property 2 — buildShareText round-trip (composição/decomposição)
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 7.1, 7.2**
 *
 * For any valid summary text (non-empty, no newlines) and valid URL
 * (non-empty, no newlines), building the share text with buildShareText
 * and splitting by "\n" produces exactly [summaryText, url].
 */
describe("Property 2: buildShareText round-trip (composição/decomposição)", () => {
  const summaryTextArb = fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => !s.includes("\n"));

  const urlArb = fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => !s.includes("\n"));

  it("for any valid summary text and URL, splitting the result by newline produces exactly [summaryText, url]", () => {
    fc.assert(
      fc.property(summaryTextArb, urlArb, (summaryText, url) => {
        const result = buildShareText(summaryText, url);
        const parts = result.split("\n");

        // Exactly two parts
        expect(parts).toHaveLength(2);

        // Round-trip: parts match originals
        expect(parts[0]).toBe(summaryText);
        expect(parts[1]).toBe(url);
      }),
      { numRuns: 100 }
    );
  });
});

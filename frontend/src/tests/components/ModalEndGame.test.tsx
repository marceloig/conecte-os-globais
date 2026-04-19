import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalEndGame from "@/components/ModalEndGame";
import { renderWithProviders } from "../utils";
import { shareResult } from "@/lib/share";

vi.mock("@/lib/share", () => ({
  shareResult: vi.fn(),
}));

const mockGraph = {
  grau: 2,
  found: true,
  nodes: [
    { name: "Ator A", type: "ator" },
    { name: "Novela X", type: "novela" },
    { name: "Ator B", type: "ator" },
  ],
};

describe("ModalEndGame", () => {
  beforeEach(() => {
    vi.mocked(shareResult).mockReset();
  });

  it("renders the dialog when open is true", () => {
    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Fim de jogo")).toBeInTheDocument();
  });

  it("does not render the dialog when open is false", () => {
    renderWithProviders(
      <ModalEndGame open={false} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays congratulations message", () => {
    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    expect(screen.getByText(/parabéns/i)).toBeInTheDocument();
    expect(
      screen.getByText(/conseguiu conectar os artistas globais/i)
    ).toBeInTheDocument();
  });

  it("has a close button", () => {
    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    expect(screen.getByRole("button", { name: /fechar/i })).toBeInTheDocument();
  });

  it("calls onOpenChange when dialog state changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={onOpenChange} graph={mockGraph} />
    );

    await user.click(screen.getByRole("button", { name: /fechar/i }));

    expect(onOpenChange).toHaveBeenCalled();
  });

  it("renders with default props without crashing", () => {
    renderWithProviders(<ModalEndGame />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders 'Compartilhar' button when graph.found is true and nodes has 3+ elements", () => {
    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    expect(
      screen.getByRole("button", { name: /compartilhar/i })
    ).toBeInTheDocument();
  });

  it("does NOT render 'Compartilhar' button when graph.found is false or nodes is invalid", () => {
    const graphNotFound = { grau: 2, found: false, nodes: mockGraph.nodes };
    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={graphNotFound} />
    );
    expect(
      screen.queryByRole("button", { name: /compartilhar/i })
    ).not.toBeInTheDocument();
  });

  it("does NOT render 'Compartilhar' button when nodes has fewer than 3 elements", () => {
    const graphFewNodes = {
      grau: 1,
      found: true,
      nodes: [{ name: "Ator A", type: "ator" }],
    };
    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={graphFewNodes} />
    );
    expect(
      screen.queryByRole("button", { name: /compartilhar/i })
    ).not.toBeInTheDocument();
  });

  it("does NOT render 'Compartilhar' button when graph is undefined", () => {
    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={undefined} />
    );
    expect(
      screen.queryByRole("button", { name: /compartilhar/i })
    ).not.toBeInTheDocument();
  });

  it("calls shareResult when share button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(shareResult).mockResolvedValue({ status: "shared" });

    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    const shareButton = screen.getByRole("button", {
      name: /compartilhar/i,
    });
    await user.click(shareButton);

    expect(shareResult).toHaveBeenCalledOnce();
    expect(shareResult).toHaveBeenCalledWith(mockGraph.nodes);
  });

  it("disables the share button while sharing is in progress", async () => {
    const user = userEvent.setup();

    // Create a promise that we control — shareResult won't resolve until we say so
    let resolveShare!: (value: { status: "shared" }) => void;
    vi.mocked(shareResult).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveShare = resolve;
        })
    );

    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    const shareButton = screen.getByRole("button", {
      name: /compartilhar/i,
    });

    // Button should be enabled before clicking
    expect(shareButton).not.toBeDisabled();

    await user.click(shareButton);

    // Button should be disabled while sharing is in progress
    await waitFor(() => {
      expect(shareButton).toBeDisabled();
    });

    // Resolve the pending share
    resolveShare({ status: "shared" });

    // Button should be re-enabled after sharing completes
    await waitFor(() => {
      expect(shareButton).not.toBeDisabled();
    });
  });

  it("shows 'Copiado!' feedback for 2 seconds after clipboard copy", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    vi.mocked(shareResult).mockResolvedValue({ status: "copied" });

    renderWithProviders(
      <ModalEndGame open={true} onOpenChange={vi.fn()} graph={mockGraph} />
    );

    const shareButton = screen.getByRole("button", {
      name: /compartilhar/i,
    });

    await user.click(shareButton);

    // After clicking, the button text should change to "Copiado!"
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /copiado!/i })).toBeInTheDocument();
    });

    // Advance time by 2000ms
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // The button text should revert to "Compartilhar"
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /compartilhar/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /copiado!/i })
      ).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

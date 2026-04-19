import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalEndGame from "@/components/ModalEndGame";
import { renderWithProviders } from "../utils";

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
});

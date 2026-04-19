import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalHowToPlay from "@/components/ModalHowToPlay";
import { renderWithTheme } from "../utils";

describe("ModalHowToPlay", () => {
  it("renders the trigger button", () => {
    renderWithTheme(<ModalHowToPlay />);
    expect(screen.getByRole("button", { name: /como jogar/i })).toBeInTheDocument();
  });

  it("opens the dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ModalHowToPlay />);

    await user.click(screen.getByRole("button", { name: /como jogar/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Conecte os Globais")).toBeInTheDocument();
  });

  it("displays game instructions in the dialog", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ModalHowToPlay />);

    await user.click(screen.getByRole("button", { name: /como jogar/i }));

    expect(
      screen.getByText(/objetivo do jogo é conectar dois atores globais/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/novo jogo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/caminho mais curto entre os dois atores/i)
    ).toBeInTheDocument();
  });

  it("has a close button inside the dialog", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ModalHowToPlay />);

    await user.click(screen.getByRole("button", { name: /como jogar/i }));

    expect(screen.getByRole("button", { name: /fechar/i })).toBeInTheDocument();
  });

  it("closes the dialog when Fechar is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<ModalHowToPlay />);

    await user.click(screen.getByRole("button", { name: /como jogar/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fechar/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

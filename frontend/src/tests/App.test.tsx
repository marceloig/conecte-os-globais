import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { renderWithTheme } from "./utils";
import axios from "axios";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    isAxiosError: vi.fn().mockReturnValue(false),
  },
}));

const mockedAxios = vi.mocked(axios);

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app title", () => {
    renderWithTheme(<App />);
    // FuzzyText renders a canvas, so we check the canvas exists
    const canvases = document.querySelectorAll("canvas");
    expect(canvases.length).toBeGreaterThan(0);
  });

  it("renders the Novo jogo button", () => {
    renderWithTheme(<App />);
    expect(
      screen.getByRole("button", { name: /novo jogo/i })
    ).toBeInTheDocument();
  });

  it("renders the Como Jogar button", () => {
    renderWithTheme(<App />);
    expect(
      screen.getByRole("button", { name: /como jogar/i })
    ).toBeInTheDocument();
  });

  it("calls API when Novo jogo is clicked", async () => {
    const user = userEvent.setup();

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { name: "Ator A", img: "https://example.com/a.jpg" },
      })
      .mockResolvedValueOnce({
        data: { name: "Ator B", img: "https://example.com/b.jpg" },
      })
      // GraphNode useEffect calls for each actor's novelas
      .mockResolvedValue({ data: [] });

    renderWithTheme(<App />);

    await user.click(screen.getByRole("button", { name: /novo jogo/i }));

    await waitFor(() => {
      // 2 random actor calls + 2 GraphNode useEffect calls (novelas for each actor)
      expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    });
  });

  it("displays actor nodes after starting a new game", async () => {
    const user = userEvent.setup();

    mockedAxios.get.mockResolvedValueOnce({
      data: { name: "Fernanda Montenegro", img: "https://example.com/fm.jpg" },
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: { name: "Tony Ramos", img: "https://example.com/tr.jpg" },
    });

    renderWithTheme(<App />);

    await user.click(screen.getByRole("button", { name: /novo jogo/i }));

    await waitFor(() => {
      expect(screen.getByText("Fernanda Montenegro")).toBeInTheDocument();
      expect(screen.getByText("Tony Ramos")).toBeInTheDocument();
    });
  });

  it("handles API error gracefully on new game", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    renderWithTheme(<App />);

    await user.click(screen.getByRole("button", { name: /novo jogo/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("renders placeholder nodes initially", () => {
    renderWithTheme(<App />);
    const plusSigns = screen.getAllByText("+");
    expect(plusSigns.length).toBe(2);
  });
});

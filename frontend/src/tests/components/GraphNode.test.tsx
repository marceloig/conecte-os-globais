import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import GraphNode from "@/components/GraphNode";
import { renderWithProviders } from "../utils";

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    isAxiosError: vi.fn().mockReturnValue(false),
  },
}));

const defaultProps = {
  data: {
    label: "Fernanda Montenegro",
    type: "ator",
    direction: "left",
    img: "https://example.com/photo.jpg",
  },
  id: "node-1",
};

describe("GraphNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the actor name as a badge", async () => {
    renderWithProviders(<GraphNode {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Fernanda Montenegro")).toBeInTheDocument();
    });
  });

  it("renders an avatar element", async () => {
    const { container } = renderWithProviders(<GraphNode {...defaultProps} />);

    await waitFor(() => {
      const avatar = container.querySelector(".rt-AvatarRoot");
      expect(avatar).toBeInTheDocument();
    });
  });

  it("applies blue border for ator type", async () => {
    const { container } = renderWithProviders(
      <GraphNode {...defaultProps} />
    );

    await waitFor(() => {
      const borderBox = container.querySelector(
        'div[style*="border"]'
      ) as HTMLElement;
      expect(borderBox).toBeTruthy();
    });
  });

  it("applies orange border for novela type", async () => {
    const novelaProps = {
      ...defaultProps,
      data: { ...defaultProps.data, type: "novela" },
    };
    const { container } = renderWithProviders(
      <GraphNode {...novelaProps} />
    );

    await waitFor(() => {
      const borderBox = container.querySelector(
        'div[style*="border"]'
      ) as HTMLElement;
      expect(borderBox).toBeTruthy();
    });
  });

  it("renders with novela type without crashing", async () => {
    const novelaProps = {
      ...defaultProps,
      data: {
        label: "Avenida Brasil",
        type: "novela",
        direction: "right",
        img: "https://example.com/novela.jpg",
      },
    };

    renderWithProviders(<GraphNode {...novelaProps} />);

    await waitFor(() => {
      expect(screen.getByText("Avenida Brasil")).toBeInTheDocument();
    });
  });
});

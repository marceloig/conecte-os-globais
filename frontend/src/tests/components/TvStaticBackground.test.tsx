import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import TvStaticBackground from "@/components/TvStaticBackground";

describe("TvStaticBackground", () => {
  it("renders a canvas element", () => {
    const { container } = render(<TvStaticBackground />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("applies correct inline styles", () => {
    const { container } = render(<TvStaticBackground />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;

    expect(canvas.style.position).toBe("absolute");
    expect(canvas.style.width).toBe("100%");
    expect(canvas.style.height).toBe("100%");
    expect(canvas.style.imageRendering).toBe("pixelated");
    expect(canvas.style.opacity).toBe("0.7");
    expect(canvas.style.pointerEvents).toBe("none");
  });
});

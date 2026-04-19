import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// Mock import.meta.env
vi.stubEnv("VITE_API_ENDPOINT", "http://localhost:8000");

// Mock canvas context for FuzzyText and TvStaticBackground
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillText: vi.fn(),
  measureText: vi.fn().mockReturnValue({
    width: 100,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 100,
    actualBoundingBoxAscent: 20,
    actualBoundingBoxDescent: 5,
  }),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  translate: vi.fn(),
  createImageData: vi.fn().mockReturnValue({
    data: { buffer: new ArrayBuffer(4) },
  }),
  putImageData: vi.fn(),
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock ResizeObserver as a proper class
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock requestAnimationFrame / cancelAnimationFrame
vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
  return setTimeout(() => cb(0), 0) as unknown as number;
});
vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
  clearTimeout(id);
});

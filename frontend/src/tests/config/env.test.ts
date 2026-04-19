import { describe, it, expect } from "vitest";
import { env } from "@/config/env";

describe("env config", () => {
  it("exports env object", () => {
    expect(env).toBeDefined();
  });

  it("contains VITE_API_ENDPOINT from stubbed env", () => {
    expect(env.VITE_API_ENDPOINT).toBe("http://localhost:8000");
  });
});

import { vi } from "vitest";

const axiosMock = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  isAxiosError: vi.fn().mockReturnValue(false),
  create: vi.fn().mockReturnThis(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
};

export default axiosMock;

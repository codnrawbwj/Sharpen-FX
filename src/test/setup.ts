import "@testing-library/jest-dom";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => ({
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
  }),
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

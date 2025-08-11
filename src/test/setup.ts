import "@testing-library/jest-dom";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: (contextId: string) => {
    if (contextId === "2d") {
      return {
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(100),
          width: 100,
          height: 100,
        })),
        putImageData: vi.fn(),
        canvas: document.createElement("canvas"),
      };
    }
    return null;
  },
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

global.ImageData = vi.fn().mockImplementation((data, width, height) => ({
  data,
  width,
  height,
  colorSpace: "srgb",
}));

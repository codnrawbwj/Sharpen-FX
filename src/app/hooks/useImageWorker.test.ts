import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useImageWorker } from "./useImageWorker";

const mockWorker = {
  postMessage: vi.fn(),
  terminate: vi.fn(),
  cleanup: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onmessage: null as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: null as any,
};

vi.mock("@/app/webWorkers/ImageWorker", () => ({
  createImageWorker: vi.fn(() => mockWorker),
}));

vi.mock("@/app/utils/errorHandler", () => ({
  handleError: vi.fn(),
}));

describe("useImageWorker", () => {
  const mockOnProcessed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockWorker.onmessage = null;
    mockWorker.onerror = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Need to set the initial state correctly", async () => {
    const { result } = renderHook(() => useImageWorker(mockOnProcessed));

    await waitFor(() => {
      expect(result.current.worker).toBe(mockWorker);
    });

    expect(result.current.processing).toBe(false);
    expect(result.current.processImage).toBeDefined();
    expect(result.current.resetProcessing).toBeDefined();
  });

  it("Need to check if the processImage function is actually called", async () => {
    const { result } = renderHook(() => useImageWorker(mockOnProcessed));

    await waitFor(() => {
      expect(result.current.worker).toBe(mockWorker);
    });

    const mockImageData = {
      data: new Uint8ClampedArray(100),
      width: 10,
      height: 10,
    } as ImageData;

    act(() => {
      result.current.processImage(mockImageData, 1.5);
    });

    expect(mockWorker.postMessage).toHaveBeenCalled();
  });

  it("Need to start image processing", async () => {
    const { result } = renderHook(() => useImageWorker(mockOnProcessed));

    const mockImageData = {
      data: new Uint8ClampedArray(100),
      width: 10,
      height: 10,
    } as ImageData;

    await waitFor(() => {
      expect(result.current.worker).toBe(mockWorker);
    });

    act(() => {
      result.current.processImage(mockImageData, 1.5);
    });

    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      { imageData: mockImageData, strength: 1.5 },
      [mockImageData.data.buffer]
    );

    expect(result.current.processing).toBe(true);
  });

  it("Need to update the processing state when receiving a message from the worker", async () => {
    const { result } = renderHook(() => useImageWorker(mockOnProcessed));

    await waitFor(() => {
      expect(result.current.worker).toBe(mockWorker);
    });

    const mockProcessedData = {
      data: new Uint8ClampedArray(100),
      width: 10,
      height: 10,
    } as ImageData;

    act(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({
          data: { imageData: mockProcessedData },
        } as MessageEvent);
      }
    });

    expect(mockOnProcessed).toHaveBeenCalledWith(mockProcessedData);
    expect(result.current.processing).toBe(false);
  });

  it("Need to reset the processing state", async () => {
    const { result } = renderHook(() => useImageWorker(mockOnProcessed));

    await waitFor(() => {
      expect(result.current.worker).toBe(mockWorker);
    });

    act(() => {
      result.current.resetProcessing();
    });

    expect(result.current.processing).toBe(false);
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ImageBoard from "./ImageBoard";

// Mock dependencies
vi.mock("@/app/hooks/useImageWorker", () => ({
  useImageWorker: vi.fn(() => ({
    processing: false,
    processImage: vi.fn(),
    resetProcessing: vi.fn(),
  })),
}));

vi.mock("@/app/utils/errorHandler", () => ({
  handleError: vi.fn(),
}));

vi.mock("@/app/utils/imageUtils", () => ({
  resizeImage: vi.fn(() => ({ w: 800, h: 600 })),
}));

vi.mock("@/app/utils/constants", () => ({
  ERROR_MESSAGES: {
    FILE_TYPE_INVALID: "Invalid file type",
    IMAGE_LOADING_ERROR: "Image loading error",
    RESOURCES_UNAVAILABLE: "Resources unavailable",
    CANVAS_CONTEXT_FAILED: "Canvas context failed",
    CANVAS_NOT_FOUND: "Canvas not found",
  },
  IMAGE_CONSTRAINTS: {
    MAX_WIDTH: 1000,
    SUPPORTED_FORMATS: [".jpg", ".jpeg", ".png"],
  },
}));

describe("ImageBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Canvas 모킹
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: () => ({
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(100),
          width: 800,
          height: 600,
        })),
        putImageData: vi.fn(),
        drawImage: vi.fn(),
      }),
    });

    // URL API 모킹
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    global.URL.revokeObjectURL = vi.fn();

    // alert 모킹
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Need to show the file upload area in the initial state", () => {
    render(<ImageBoard />);

    expect(
      screen.getByText("Drag & Drop or click to select an image")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Supports JPG / PNG. Large images scaled to width 1200px for performance."
      )
    ).toBeInTheDocument();
  });

  it("Need to upload an image file", async () => {
    const mockFile = new File(["mock content"], "test.jpg", {
      type: "image/jpeg",
    });

    render(<ImageBoard />);

    const fileInput = screen.getByDisplayValue("");

    // Image 생성자 모킹을 테스트별로 설정
    const mockImage = {
      src: "",
      onload: vi.fn(),
      onerror: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Image = vi.fn(() => mockImage) as any;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // onload 콜백을 직접 호출하여 이미지 로드 완료 시뮬레이션
    mockImage.onload();

    await waitFor(() => {
      expect(screen.getByText("Sharpen Image")).toBeInTheDocument();
    });
  });

  it("Need to draw the image on the canvas after loading", async () => {
    const mockFile = new File(["mock content"], "test.jpg", {
      type: "image/jpeg",
    });

    render(<ImageBoard />);

    const fileInput = screen.getByDisplayValue("");

    const mockImage = {
      src: "",
      onload: vi.fn(),
      onerror: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Image = vi.fn(() => mockImage) as any;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // onload 콜백을 직접 호출
    mockImage.onload();

    await waitFor(() => {
      expect(screen.getByText("Sharpen Image")).toBeInTheDocument();
      expect(screen.getByText("Before / After Comparison")).toBeInTheDocument();
    });
  });

  it("Need to show image controls when image is loaded", async () => {
    const mockFile = new File(["mock content"], "test.jpg", {
      type: "image/jpeg",
    });

    render(<ImageBoard />);

    const fileInput = screen.getByDisplayValue("");

    const mockImage = {
      src: "",
      onload: vi.fn(),
      onerror: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Image = vi.fn(() => mockImage) as any;

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // onload 콜백을 직접 호출
    mockImage.onload();

    await waitFor(() => {
      expect(screen.getByText("Sharpen Image")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
      expect(screen.getByText("Download")).toBeInTheDocument();
      expect(screen.getByText("Before / After Comparison")).toBeInTheDocument();
    });
  });
});

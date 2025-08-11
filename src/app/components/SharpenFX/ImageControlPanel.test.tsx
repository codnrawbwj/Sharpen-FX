import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ImageContorlPanel from "./ImageContorlPanel";

// Mock canvas refs
const mockInputRef = {
  current: document.createElement("input"),
};

const mockCanvasRef = {
  current: document.createElement("canvas"),
};

const mockProcessedCanvasRef = {
  current: document.createElement("canvas"),
};

describe("ImageControlPanel", () => {
  const mockOnProcess = vi.fn();
  const mockCleanupPrevImage = vi.fn();
  const mockSetHasImage = vi.fn();
  const mockSetImgSize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Need to render the process button", () => {
    render(
      <ImageContorlPanel
        processing={false}
        hasProcessedImage={false}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    // 실제 버튼 텍스트로 테스트
    expect(screen.getByText("Sharpen Image")).toBeInTheDocument();
  });

  it("Need to disable the button when processing", () => {
    render(
      <ImageContorlPanel
        processing={true}
        hasProcessedImage={false}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    // 처리 중일 때는 "Processing..." 텍스트가 표시되고 버튼이 비활성화됨
    expect(screen.getByText("Processing...")).toBeInTheDocument();
    const processButton = screen.getByText("Processing...");
    expect(processButton).toBeDisabled();
  });

  it("Need to call the onProcess function when the process button is clicked", () => {
    render(
      <ImageContorlPanel
        processing={false}
        hasProcessedImage={false}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    const processButton = screen.getByText("Sharpen Image");
    fireEvent.click(processButton);

    expect(mockOnProcess).toHaveBeenCalledTimes(1);
  });

  it("Need to render the reset button", () => {
    render(
      <ImageContorlPanel
        processing={false}
        hasProcessedImage={false}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    // 실제 버튼 텍스트로 테스트
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("Need to call the cleanup functions when the reset button is clicked", () => {
    render(
      <ImageContorlPanel
        processing={false}
        hasProcessedImage={false}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(mockCleanupPrevImage).toHaveBeenCalledTimes(1);
    expect(mockSetHasImage).toHaveBeenCalledWith(false);
    expect(mockSetImgSize).toHaveBeenCalledWith({ w: 0, h: 0 });
  });

  it("Need to render the download button", () => {
    render(
      <ImageContorlPanel
        processing={false}
        hasProcessedImage={false}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("Need to disable download button when no processed image", () => {
    render(
      <ImageContorlPanel
        processing={false}
        hasProcessedImage={false}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    const downloadButton = screen.getByText("Download");
    expect(downloadButton).toBeDisabled();
  });

  it("Need to enable download button when processed image exists", () => {
    render(
      <ImageContorlPanel
        processing={false}
        hasProcessedImage={true}
        onProcess={mockOnProcess}
        cleanupPrevImage={mockCleanupPrevImage}
        setHasImage={mockSetHasImage}
        setImgSize={mockSetImgSize}
        inputRef={mockInputRef}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    const downloadButton = screen.getByText("Download");
    expect(downloadButton).not.toBeDisabled();
  });
});

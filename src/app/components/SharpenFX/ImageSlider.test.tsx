import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ImageSlider from "./ImageSlider";

// Mock canvas refs
const mockCanvasRef = {
  current: document.createElement("canvas"),
};

const mockProcessedCanvasRef = {
  current: document.createElement("canvas"),
};

describe("ImageSlider", () => {
  it("Need to render the slider when there is an image", () => {
    render(
      <ImageSlider
        hasImage={true}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    expect(screen.getByText("Before / After Comparison")).toBeInTheDocument();
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });

  it("Need to not render the slider when there is no image", () => {
    render(
      <ImageSlider
        hasImage={false}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    expect(
      screen.queryByText("Before / After Comparison")
    ).not.toBeInTheDocument();
  });

  it("Need to display both the original and processed images", () => {
    render(
      <ImageSlider
        hasImage={true}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();

    const canvases = document.querySelectorAll("canvas");
    expect(canvases.length).toBe(2);
  });

  it("Need to have proper slider functionality elements", () => {
    render(
      <ImageSlider
        hasImage={true}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    const sliderContainer = screen
      .getByText("Before / After Comparison")
      .closest("div");
    expect(sliderContainer).toBeInTheDocument();

    const sliderHandle = document.querySelector(
      ".w-6.h-6.bg-white.rounded-full"
    );
    expect(sliderHandle).toBeInTheDocument();
  });

  it("Need to have proper styling classes", () => {
    render(
      <ImageSlider
        hasImage={true}
        canvasRef={mockCanvasRef}
        processedCanvasRef={mockProcessedCanvasRef}
      />
    );

    const mainContainer = screen
      .getByText("Before / After Comparison")
      .closest("div");
    expect(mainContainer).toHaveClass("w-full");

    const sliderContainer = document.querySelector(
      ".relative.w-full.h-\\[600px\\].bg-gray-900"
    );
    expect(sliderContainer).toBeInTheDocument();

    const beforeLabel = screen.getByText("Before").closest("div");
    expect(beforeLabel).toHaveClass(
      "absolute",
      "bottom-2",
      "right-2",
      "text-xs",
      "text-white",
      "bg-black/50",
      "px-2",
      "py-1",
      "rounded"
    );
  });
});

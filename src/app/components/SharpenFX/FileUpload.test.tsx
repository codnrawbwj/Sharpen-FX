import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FileUpload from "./FileUpload";

// Mock ref
const mockInputRef = {
  current: document.createElement("input"),
};

describe("FileUpload", () => {
  const mockHandleFiles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Need to render the drag and drop area", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    expect(
      screen.getByText("Drag & Drop or click to select an image")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Supports JPG / PNG. Large images scaled to width 1200px for performance."
      )
    ).toBeInTheDocument();
  });

  it("Need to hide the file input field", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    const fileInput = screen.getByDisplayValue("");
    expect(fileInput).toHaveClass("hidden");
  });

  it("Need to call the handleFiles function when a file is selected", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    const fileInput = screen.getByDisplayValue("");
    const mockFile = new File(["mock content"], "test.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(mockHandleFiles).toHaveBeenCalledWith(mockFile);
  });

  it("Need to process only the first file when multiple files are selected", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    const fileInput = screen.getByDisplayValue("");
    const mockFile1 = new File(["content1"], "test1.jpg", {
      type: "image/jpeg",
    });
    const mockFile2 = new File(["content2"], "test2.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, { target: { files: [mockFile1, mockFile2] } });

    expect(mockHandleFiles).toHaveBeenCalledWith(mockFile1);
    expect(mockHandleFiles).toHaveBeenCalledTimes(1);
  });

  it("Need to not call handleFiles when no file is selected", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    const fileInput = screen.getByDisplayValue("");

    fireEvent.change(fileInput, { target: { files: [] } });

    expect(mockHandleFiles).not.toHaveBeenCalled();
  });

  it("Need to have proper file input attributes", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    const fileInput = screen.getByDisplayValue("");

    expect(fileInput).toHaveAttribute("type", "file");
    expect(fileInput).toHaveAttribute("accept", ".jpg,.jpeg,.png");
    expect(fileInput).toHaveClass("hidden");
  });

  it("Need to have proper styling classes", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    const mainContainer = screen.getByText(
      "Drag & Drop or click to select an image"
    ).parentElement?.parentElement;
    expect(mainContainer).toBeInTheDocument();

    expect(mainContainer).toHaveClass(
      "flex-1",
      "border",
      "border-gray-300",
      "rounded-lg",
      "p-6",
      "text-center",
      "hover:border-gray-400",
      "cursor-pointer",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "w-full"
    );
  });

  it("Need to have proper text content structure", () => {
    render(
      <FileUpload handleFiles={mockHandleFiles} inputRef={mockInputRef} />
    );

    expect(
      screen.getByText("Drag & Drop or click to select an image")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Supports JPG / PNG. Large images scaled to width 1200px for performance."
      )
    ).toBeInTheDocument();

    const mainText = screen.getByText(
      "Drag & Drop or click to select an image"
    );
    const subText = screen.getByText(
      "Supports JPG / PNG. Large images scaled to width 1200px for performance."
    );

    expect(mainText.tagName).toBe("P");
    expect(subText.tagName).toBe("P");
  });
});

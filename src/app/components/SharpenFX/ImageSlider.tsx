import { useEffect, useRef, useState } from "react";

const ImageSlider = ({
  hasImage,
  canvasRef,
  processedCanvasRef,
}: {
  hasImage: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  processedCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(0.5);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      updateSliderPosition(e.clientX, container);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateSliderPosition(e.clientX, container);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true);
      updateSliderPosition(e.touches[0].clientX, container);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      updateSliderPosition(e.touches[0].clientX, container);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const updateSliderPosition = (clientX: number, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(1, x / rect.width));
    setSliderPosition(position);
  };

  if (!hasImage) return null;

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-100 mb-2 text-center">
        Before / After Comparison
      </h3>

      <div
        ref={sliderContainerRef}
        className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden cursor-ew-resize"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ maxWidth: "100%", height: "auto", display: "block" }}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 ${(1 - sliderPosition) * 100}% 0 0)`,
          }}
        >
          <canvas
            ref={processedCanvasRef}
            className="w-full h-full object-contain"
            style={{ maxWidth: "100%", height: "auto", display: "block" }}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
          style={{ left: `${sliderPosition * 100}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          After
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          Before
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;

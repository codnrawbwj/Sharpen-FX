import { useEffect, useRef, useState } from "react";

const ImageSlider = ({
  hasImage,
  canvasRef,
  afterCanvasRef,
  hiddenCanvasRef,
}: {
  hasImage: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  afterCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  hiddenCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(0.5);
  const isDragging = useRef<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      updateSliderPosition(e.clientX, container);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      updateSliderPosition(e.clientX, container);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      updateSliderPosition(e.touches[0].clientX, container);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      updateSliderPosition(e.touches[0].clientX, container);
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const updateSliderPosition = (clientX: number, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(1, x / rect.width));
    setSliderPosition(position);
  };

  return (
    <div className={`absolute inset-0 ${!hasImage ? "hidden" : ""}`}>
      <div
        ref={sliderContainerRef}
        className="relative w-full h-full bg-[#0a0a0a] cursor-ew-resize overflow-hidden"
      >
        {/* Before (original) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ display: "block" }}
        />

        {/* After (processed) — clipped to reveal from left */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${(1 - sliderPosition) * 100}% 0 0)` }}
        >
          <canvas
            ref={afterCanvasRef}
            className="w-full h-full object-contain"
            style={{ display: "block" }}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          style={{ left: `${sliderPosition * 100}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 7H1M1 7L3 5M1 7L3 9" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 7H13M13 7L11 5M13 7L11 9" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 text-xs text-white/70 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
          Before
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
          After
        </div>

        {/* Always in DOM so the inactive pipeline's ref remains valid */}
        <canvas ref={hiddenCanvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageSlider;

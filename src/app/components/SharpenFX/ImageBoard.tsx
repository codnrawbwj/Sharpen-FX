"use client";

import FileUpload from "@/app/components/SharpenFX/FileUpload";
import ImageContorlPanel from "@/app/components/SharpenFX/ImageContorlPanel";
import ImageSlider from "@/app/components/SharpenFX/ImageSlider";
import { useImageWorker } from "@/app/hooks/useImageWorker";
import { useWebGLProcessor } from "@/app/hooks/useWebGLProcessor";
import { ImageSize } from "@/app/types/types";
import { ERROR_MESSAGES, IMAGE_CONSTRAINTS } from "@/app/utils/constants";
import { handleError } from "@/app/utils/errorHandler";
import { downloadCanvas, resizeImage } from "@/app/utils/imageUtils";
import { useCallback, useEffect, useRef, useState } from "react";

const ImageBoard = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Three canvas refs:
  // canvasRef        → original image (2D, always)
  // processedCanvasRef → CPU mode output (2D)
  // webglCanvasRef   → GPU mode output (WebGL)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);

  // Image state
  const [imgSize, setImgSize] = useState<ImageSize>({ w: 0, h: 0 });
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState<HTMLImageElement | null>(null);

  // Processing state
  const [strength, setStrength] = useState<number>(1.0);
  const [useGPU, setUseGPU] = useState<boolean>(true);
  const [gpuError, setGpuError] = useState<string | null>(null);
  const [hasCPUProcessed, setHasCPUProcessed] = useState<boolean>(false);

  // --- CPU Worker ---
  const handleWorkerProcessed = useCallback((imageData: ImageData) => {
    const canvas = processedCanvasRef.current;
    if (!canvas) return;

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const id = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );
      ctx.putImageData(id, 0, 0);
      setHasCPUProcessed(true);
    }
  }, []);

  const { processing, processImage: processImageFromHook } = useImageWorker(
    handleWorkerProcessed
  );

  // --- GPU (WebGL) ---
  const { render, isSupported, isReady } = useWebGLProcessor(
    webglCanvasRef,
    currentImg
  );

  // Auto-switch to CPU if WebGL is not supported
  useEffect(() => {
    if (!isSupported) {
      setUseGPU(false);
      setGpuError("WebGL2 is not supported on this device. Switched to CPU mode.");
    }
  }, [isSupported]);

  // GPU mode: re-render whenever strength changes (real-time)
  useEffect(() => {
    if (useGPU && isReady) {
      render(strength);
    }
  }, [strength, useGPU, isReady, render]);

  // --- Image handling ---
  const cleanupPrevImage = () => {
    try {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
      }
      if (currentImg) {
        currentImg.onerror = null;
        currentImg.src = "";
        setCurrentImg(null);
      }
    } catch (error) {
      handleError(error as Error, "cleanup");
    }
  };

  const handleFiles = (file: File) => {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(ERROR_MESSAGES.FILE_TYPE_INVALID);
      }

      cleanupPrevImage();
      setStrength(1.0);
      setHasCPUProcessed(false);

      const img = new Image();

      img.onerror = () => {
        handleError(new Error(ERROR_MESSAGES.IMAGE_LOADING_ERROR), "image loading");
      };

      img.onload = () => {
        try {
          const { w, h } = resizeImage(img, IMAGE_CONSTRAINTS.MAX_WIDTH);
          setImgSize({ w, h });
          setHasImage(true);
          setCurrentImg(img);
        } catch (error) {
          handleError(error as Error, "image resizing");
        }
      };

      const newUrl = URL.createObjectURL(file);
      setImageUrl(newUrl);
      img.src = newUrl;
    } catch (error) {
      handleError(error as Error, "file handling");
    }
  };

  // CPU mode: manual sharpen trigger
  const processImage = () => {
    try {
      if (!currentImg || !canvasRef.current) {
        throw new Error(ERROR_MESSAGES.RESOURCES_UNAVAILABLE);
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(ERROR_MESSAGES.CANVAS_CONTEXT_FAILED);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      processImageFromHook(imageData, strength);
    } catch (error) {
      handleError(error as Error, "image processing");
    }
  };

  const handleReset = () => {
    cleanupPrevImage();
    setHasImage(false);
    setImgSize({ w: 0, h: 0 });
    setStrength(1.0);
    setHasCPUProcessed(false);

    if (inputRef.current) inputRef.current.value = "";

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    const processedCanvas = processedCanvasRef.current;
    if (processedCanvas) {
      const ctx = processedCanvas.getContext("2d");
      ctx?.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    }
  };

  const handleDownload = () => {
    const canvas = useGPU ? webglCanvasRef.current : processedCanvasRef.current;
    if (!canvas) return;
    try {
      downloadCanvas(canvas, `sharpened-FX-${Date.now()}.png`);
    } catch (error) {
      handleError(error as Error, "download");
    }
  };

  const handleToggleGPU = () => {
    setStrength(1.0);
    setHasCPUProcessed(false);

    const processedCanvas = processedCanvasRef.current;
    if (processedCanvas) {
      const ctx = processedCanvas.getContext("2d");
      ctx?.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    }

    setUseGPU((prev) => !prev);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPrevImage();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw original image to canvasRef when image loads
  useEffect(() => {
    if (hasImage && currentImg && imgSize.w > 0 && imgSize.h > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = imgSize.w;
      canvas.height = imgSize.h;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(currentImg, 0, 0, imgSize.w, imgSize.h);

      const webglCanvas = webglCanvasRef.current;
      if (webglCanvas) {
        webglCanvas.width = imgSize.w;
        webglCanvas.height = imgSize.h;
      }
    }
  }, [hasImage, currentImg, imgSize.w, imgSize.h]);

  const isProcessed = useGPU ? isReady : hasCPUProcessed;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left: Image viewer */}
      <div className="flex-1 relative bg-[#0a0a0a]">

        {/* GPU error banner */}
        {gpuError && (
          <div className="absolute top-4 left-4 right-4 z-10 px-4 py-2 text-xs text-yellow-300 bg-yellow-950/60 border border-yellow-700/40 rounded-lg backdrop-blur-sm">
            {gpuError}
          </div>
        )}

        {/* ImageSlider is always in the DOM so canvas refs are valid on mount.
            It positions itself to fill the area when hasImage, hidden otherwise. */}
        <ImageSlider
          hasImage={hasImage}
          canvasRef={canvasRef}
          afterCanvasRef={useGPU ? webglCanvasRef : processedCanvasRef}
          hiddenCanvasRef={useGPU ? processedCanvasRef : webglCanvasRef}
        />

        {/* File upload — centered overlay when no image */}
        {!hasImage && (
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <FileUpload handleFiles={handleFiles} inputRef={inputRef} />
          </div>
        )}
      </div>

      {/* Right: Control panel */}
      <aside className="w-72 shrink-0 h-full flex flex-col border-l border-white/10 bg-gray-900/60 backdrop-blur-md">
        {/* Branding */}
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Sharpen<span className="text-primary-a">FX</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Image Enhancement</p>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ImageContorlPanel
            hasImage={hasImage}
            processing={processing}
            isProcessed={isProcessed}
            onProcess={processImage}
            onReset={handleReset}
            onDownload={handleDownload}
            strength={strength}
            onStrengthChange={setStrength}
            useGPU={useGPU}
            onToggleGPU={handleToggleGPU}
            gpuSupported={isSupported}
          />
        </div>
      </aside>
    </div>
  );
};

export default ImageBoard;

"use client";

import FileUpload from "@/app/components/SharpenFX/FileUpload";
import ImageContorlPanel from "@/app/components/SharpenFX/ImageContorlPanel";
import ImageSlider from "@/app/components/SharpenFX/ImageSlider";
import { useImageWorker } from "@/app/hooks/useImageWorker";
import { useWebGLProcessor } from "@/app/hooks/useWebGLProcessor";
import { ImageSize } from "@/app/types/types";
import { ERROR_MESSAGES, IMAGE_CONSTRAINTS } from "@/app/utils/constants";
import { handleError } from "@/app/utils/errorHandler";
import { resizeImage } from "@/app/utils/imageUtils";
import { useCallback, useEffect, useRef, useState } from "react";

const ImageBoard = () => {
  // Input ref
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

  const handleToggleGPU = () => {
    setStrength(1.0);

    // Clear the CPU processed canvas when switching to GPU
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

      // Size the WebGL canvas to match
      const webglCanvas = webglCanvasRef.current;
      if (webglCanvas) {
        webglCanvas.width = imgSize.w;
        webglCanvas.height = imgSize.h;
      }
    }
  }, [hasImage, currentImg, imgSize.w, imgSize.h]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
      {gpuError && (
        <div className="w-full mb-2 px-4 py-2 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 rounded">
          {gpuError}
        </div>
      )}

      {/* ImageSlider is always rendered so its canvas refs are valid on mount.
          It hides itself via CSS when hasImage is false. WebGL needs the canvas
          to exist in the DOM before it can initialize a context. */}
      <ImageSlider
        hasImage={hasImage}
        canvasRef={canvasRef}
        afterCanvasRef={useGPU ? webglCanvasRef : processedCanvasRef}
        hiddenCanvasRef={useGPU ? processedCanvasRef : webglCanvasRef}
      />

      {!hasImage ? (
        <FileUpload handleFiles={handleFiles} inputRef={inputRef} />
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          <ImageContorlPanel
            processing={processing}
            hasProcessedImage={!!processedCanvasRef.current}
            onProcess={processImage}
            cleanupPrevImage={cleanupPrevImage}
            setHasImage={setHasImage}
            setImgSize={setImgSize}
            inputRef={inputRef}
            canvasRef={canvasRef}
            processedCanvasRef={processedCanvasRef}
            strength={strength}
            onStrengthChange={setStrength}
            useGPU={useGPU}
            onToggleGPU={handleToggleGPU}
            gpuSupported={isSupported}
          />
        </div>
      )}
    </div>
  );
};

export default ImageBoard;

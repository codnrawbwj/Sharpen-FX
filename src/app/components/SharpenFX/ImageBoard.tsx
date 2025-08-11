"use client";

import FileUpload from "@/app/components/SharpenFX/FileUpload";
import ImageSlider from "@/app/components/SharpenFX/ImageSlider";
import { ImageSize } from "@/app/types/types";
import { ERROR_MESSAGES, IMAGE_CONSTRAINTS } from "@/app/utils/constants";
import { downloadCanvas, resizeImage } from "@/app/utils/imageUtils";
import { createImageWorker, ImageWorker } from "@/app/webWorkers/ImageWorker";
import { useEffect, useRef, useState } from "react";

const ImageBoard = () => {
  // Input Ref
  const inputRef = useRef<HTMLInputElement>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Image states
  const [imgSize, setImgSize] = useState<ImageSize>({ w: 0, h: 0 });
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState<HTMLImageElement | null>(null);

  // Worker states
  const [worker, setWorker] = useState<ImageWorker | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const cleanupPrevImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    if (currentImg) {
      currentImg.src = "";
      setCurrentImg(null);
    }
  };

  const handleFiles = (file: File) => {
    cleanupPrevImage();

    const img = new Image();
    img.onload = () => {
      const { w, h } = resizeImage(img, IMAGE_CONSTRAINTS.MAX_WIDTH);

      setImgSize({ w, h });
      setHasImage(true);
      setCurrentImg(img);
    };

    const newUrl = URL.createObjectURL(file);
    setImageUrl(newUrl);
    img.src = newUrl;
  };

  const resetImage = () => {
    cleanupPrevImage();
    setHasImage(false);
    setImgSize({ w: 0, h: 0 });

    if (inputRef.current) {
      inputRef.current.value = "";
    }

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

  useEffect(() => {
    return () => {
      cleanupPrevImage();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasImage && currentImg && imgSize.w > 0 && imgSize.h > 0) {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error(ERROR_MESSAGES.CANVAS_NOT_FOUND);
        return;
      }

      canvas.width = imgSize.w;
      canvas.height = imgSize.h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(currentImg, 0, 0, imgSize.w, imgSize.h);
      }
    }
  }, [hasImage, currentImg, imgSize.w, imgSize.h]);

  useEffect(() => {
    const w: ImageWorker = createImageWorker() as ImageWorker;

    w.onmessage = (e) => {
      const { imageData } = e.data;

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
        setProcessing(false);
      }
    };

    setWorker(w);

    return () => {
      w.terminate();
      w.cleanup();
    };
  }, [processedCanvasRef]);

  const processImage = () => {
    if (!worker || !currentImg || !canvasRef.current) return;

    setProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    worker.postMessage(
      {
        imageData,
        strength: 1.0,
      },
      [imageData.data.buffer]
    );
  };

  const downloadImage = () => {
    if (!processedCanvasRef.current) {
      alert(ERROR_MESSAGES.DOWNLOAD_NOT_PROCESSED);
      return;
    }

    const canvas = processedCanvasRef.current;

    try {
      downloadCanvas(canvas, `sharpened-FX-${Date.now()}.png`);
    } catch (error) {
      console.error(ERROR_MESSAGES.DOWNLOAD_ERROR, error);
      alert(ERROR_MESSAGES.DOWNLOAD_ERROR);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
      {!hasImage ? (
        <FileUpload handleFiles={handleFiles} inputRef={inputRef} />
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          <ImageSlider
            hasImage={hasImage}
            canvasRef={canvasRef}
            processedCanvasRef={processedCanvasRef}
          />

          <div className="flex gap-2">
            <button
              onClick={processImage}
              disabled={processing}
              className={`px-4 py-2 text-sm rounded border btn ${
                processing
                  ? "opacity-50 cursor-not-allowed bg-gray-100"
                  : "bg-primary-a text-white hover:bg-primary-a/80"
              }`}
            >
              {processing ? "Processing..." : "Sharpen Image"}
            </button>

            <button
              onClick={resetImage}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:border-gray-100 btn"
            >
              Reset
            </button>

            <button
              disabled={!processedCanvasRef.current}
              onClick={downloadImage}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:border-gray-100 btn"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBoard;

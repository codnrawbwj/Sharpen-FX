"use client";

import FileUpload from "@/app/components/SharpenFX/FileUpload";
import ImageContorlPanel from "@/app/components/SharpenFX/ImageContorlPanel";
import ImageSlider from "@/app/components/SharpenFX/ImageSlider";
import { ImageSize } from "@/app/types/types";
import { ERROR_MESSAGES, IMAGE_CONSTRAINTS } from "@/app/utils/constants";
import { handleError } from "@/app/utils/errorHandler";
import { resizeImage } from "@/app/utils/imageUtils";
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

      const img = new Image();

      img.onerror = () => {
        handleError(
          new Error(ERROR_MESSAGES.IMAGE_LOADING_ERROR),
          "image loading"
        );
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

  const processImage = () => {
    try {
      if (!worker || !currentImg || !canvasRef.current) {
        throw new Error(ERROR_MESSAGES.RESOURCES_UNAVAILABLE);
      }

      setProcessing(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error(ERROR_MESSAGES.CANVAS_CONTEXT_FAILED);
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      worker.postMessage(
        {
          imageData,
          strength: 1.0,
        },
        [imageData.data.buffer]
      );
    } catch (error) {
      setProcessing(false);
      handleError(error as Error, "image processing");
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
          />
        </div>
      )}
    </div>
  );
};

export default ImageBoard;

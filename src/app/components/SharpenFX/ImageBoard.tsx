"use client";

import ImageSlider from "@/app/components/SharpenFX/ImageSlider";
import { createImageWorker, ImageWorker } from "@/app/webWorkers/ImageWorker";
import { useEffect, useRef, useState } from "react";

const ImageBoard = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState<HTMLImageElement | null>(null);

  const [worker, setWorker] = useState<ReturnType<
    typeof createImageWorker
  > | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

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
      const w = Math.min(1200, img.width);
      const scale = w / img.width;
      const h = Math.round(img.height * scale);

      setImgSize({ w, h });
      setHasImage(true);
      setCurrentImg(img);
    };

    const newUrl = URL.createObjectURL(file);
    setImageUrl(newUrl);
    img.src = newUrl;
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFiles(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFiles(f);
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
        console.error("Canvas not found in useEffect");
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
      alert("Image Sharpening has not been processed yet.");
      return;
    }

    const canvas = processedCanvasRef.current;

    try {
      const link = document.createElement("a");
      link.download = `sharpened-FX-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Error downloading image. Please try again.");
    }
  };

  return (
    <div
      className="flex-1 border border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={onFileChange}
      />

      {!hasImage ? (
        <div className="flex flex-col items-center gap-2" onClick={handleClick}>
          <p className="text-gray-700">
            Drag & Drop or click to select an image
          </p>
          <p className="text-xs text-gray-400">
            Supports JPG / PNG. Large images scaled to width 1200px for
            performance.
          </p>
        </div>
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

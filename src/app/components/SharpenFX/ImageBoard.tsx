"use client";

import { useEffect, useRef, useState } from "react";

const ImageBoard = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [hasImage, setHasImage] = useState<boolean>(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState<HTMLImageElement | null>(null);

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
          <canvas
            ref={canvasRef}
            className="rounded shadow-sm"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          <button
            onClick={resetImage}
            className="px-4 py-2 text-s border border-gray-300 rounded hover:border-gray-400 btn"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageBoard;

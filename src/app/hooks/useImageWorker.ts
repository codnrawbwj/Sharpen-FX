import { useEffect, useState, useCallback } from "react";
import { createImageWorker, ImageWorker } from "@/app/webWorkers/ImageWorker";
import { handleError } from "@/app/utils/errorHandler";

interface UseImageWorkerReturn {
  worker: ImageWorker | null;
  processing: boolean;
  processImage: (imageData: ImageData, strength?: number) => void;
  resetProcessing: () => void;
}

export const useImageWorker = (
  onProcessed: (imageData: ImageData) => void
): UseImageWorkerReturn => {
  const [worker, setWorker] = useState<ImageWorker | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const w: ImageWorker = createImageWorker() as ImageWorker;

      w.onmessage = (e) => {
        try {
          const { imageData } = e.data;
          onProcessed(imageData);
          setProcessing(false);
        } catch (error) {
          setProcessing(false);
          handleError(error as Error, "worker message processing");
        }
      };

      w.onerror = (error) => {
        setProcessing(false);
        handleError(new Error(error.message), "worker communication");
      };

      setWorker(w);

      return () => {
        try {
          w.terminate();
          w.cleanup();
        } catch (error) {
          handleError(error as Error, "worker cleanup");
        }
      };
    } catch (error) {
      handleError(error as Error, "worker creation");
    }
  }, [onProcessed]);

  const processImage = useCallback(
    (imageData: ImageData, strength: number = 1.0) => {
      if (!worker) {
        handleError(new Error("Worker not available"), "image processing");
        return;
      }

      try {
        setProcessing(true);
        worker.postMessage(
          {
            imageData,
            strength,
          },
          [imageData.data.buffer]
        );
      } catch (error) {
        setProcessing(false);
        handleError(error as Error, "image processing");
      }
    },
    [worker]
  );

  const resetProcessing = useCallback(() => {
    setProcessing(false);
  }, []);

  return {
    worker,
    processing,
    processImage,
    resetProcessing,
  };
};

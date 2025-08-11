import { ImageControlsProps } from "@/app/types/types";
import { ERROR_MESSAGES } from "@/app/utils/constants";
import { downloadCanvas } from "@/app/utils/imageUtils";

const ImageContorlPanel = ({
  processing,
  hasProcessedImage,
  cleanupPrevImage,
  setHasImage,
  setImgSize,
  inputRef,
  canvasRef,
  processedCanvasRef,
  onProcess,
}: ImageControlsProps) => {
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
    <div className="flex gap-2">
      <button
        onClick={onProcess}
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
        disabled={!hasProcessedImage}
        onClick={downloadImage}
        className="px-4 py-2 text-sm border border-gray-300 rounded hover:border-gray-100 btn"
      >
        Download
      </button>
    </div>
  );
};

export default ImageContorlPanel;

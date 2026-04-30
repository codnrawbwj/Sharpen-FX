import { ImageControlsProps } from "@/app/types/types";

const ImageContorlPanel = ({
  hasImage,
  processing,
  isProcessed,
  onProcess,
  onReset,
  onDownload,
  strength,
  onStrengthChange,
  useGPU,
  onToggleGPU,
  gpuSupported,
}: ImageControlsProps) => {
  return (
    <div className="flex flex-col gap-6">

      {/* Engine toggle */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Engine</span>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          <button
            onClick={() => !useGPU && onToggleGPU()}
            disabled={!gpuSupported || processing}
            className={`flex-1 py-2 text-xs font-medium transition-colors duration-150 ${
              useGPU
                ? "bg-primary-a text-white"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            GPU
          </button>
          <div className="w-px bg-white/10" />
          <button
            onClick={() => useGPU && onToggleGPU()}
            disabled={processing}
            className={`flex-1 py-2 text-xs font-medium transition-colors duration-150 ${
              !useGPU
                ? "bg-primary-a text-white"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            CPU
          </button>
        </div>
        <p className="text-xs text-gray-600">
          {useGPU ? "Real-time · shader-based" : "Manual · web worker"}
        </p>
      </div>

      {/* Strength */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Strength</span>
          <span className="text-xs font-mono text-gray-300">{strength.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={strength}
          disabled={!hasImage}
          onChange={(e) => onStrengthChange(parseFloat(e.target.value))}
          className="w-full disabled:opacity-30"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>0</span>
          <span>2</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Actions</span>

        {/* Sharpen button — CPU only */}
        {!useGPU && (
          <button
            onClick={onProcess}
            disabled={processing || !hasImage}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              processing || !hasImage
                ? "bg-primary-a/30 text-white/40 cursor-not-allowed"
                : "bg-primary-a text-white hover:bg-primary-a/80 active:scale-95"
            }`}
          >
            {processing ? "Processing..." : "Sharpen Image"}
          </button>
        )}

        <button
          onClick={onDownload}
          disabled={!isProcessed}
          className="w-full py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-300 transition-all duration-150 hover:bg-white/5 hover:border-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Download
        </button>

        <button
          onClick={onReset}
          disabled={!hasImage}
          className="w-full py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-400 transition-all duration-150 hover:bg-white/5 hover:border-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      {/* Empty state hint */}
      {!hasImage && (
        <p className="text-xs text-gray-600 text-center mt-2">
          Upload an image to get started
        </p>
      )}
    </div>
  );
};

export default ImageContorlPanel;

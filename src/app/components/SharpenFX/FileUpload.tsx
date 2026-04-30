import { FileUploadProps } from "@/app/types/types";
import { IMAGE_CONSTRAINTS } from "@/app/utils/constants";

const FileUpload = ({ handleFiles, inputRef }: FileUploadProps) => {
  const handleClick = () => {
    inputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFiles(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFiles(f);
  };

  return (
    <div
      className="w-full max-w-md border-2 border-dashed border-white/15 rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 hover:border-primary-a/50 hover:bg-white/[0.02] group"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_CONSTRAINTS.SUPPORTED_FORMATS.join(",")}
        className="hidden"
        onChange={onFileChange}
      />

      {/* Upload icon */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary-a/30 transition-colors duration-200">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-primary-a transition-colors duration-200">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      </div>

      <p className="text-sm text-gray-300 font-medium mb-1">
        Drop image here
      </p>
      <p className="text-xs text-gray-600">
        or click to browse
      </p>
      <p className="text-xs text-gray-700 mt-3">
        JPG / PNG · up to {IMAGE_CONSTRAINTS.MAX_WIDTH}px wide
      </p>
    </div>
  );
};

export default FileUpload;

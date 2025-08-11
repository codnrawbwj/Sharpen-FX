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
      className="flex-1 border border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center w-full"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_CONSTRAINTS.SUPPORTED_FORMATS.join(",")}
        className="hidden"
        onChange={onFileChange}
      />
      <div className="flex flex-col items-center gap-2" onClick={handleClick}>
        <p className="text-gray-700">Drag & Drop or click to select an image</p>
        <p className="text-xs text-gray-400">
          Supports JPG / PNG. Large images scaled to width 1200px for
          performance.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;

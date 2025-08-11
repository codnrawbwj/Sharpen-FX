export interface ImageSize {
  w: number;
  h: number;
}

export interface ImageState {
  hasImage: boolean;
  imageUrl: string | null;
  currentImg: HTMLImageElement | null;
  imgSize: ImageSize;
}

export interface ImageHandlers {
  onFileSelect: (file: File) => void;
  onProcess: () => void;
  onReset: () => void;
  onDownload: () => void;
}

export interface FileUploadProps {
  handleFiles: (file: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export interface ImageControlsProps {
  processing: boolean;
  hasProcessedImage: boolean;
  onProcess: () => void;
  onReset: () => void;
  onDownload: () => void;
}

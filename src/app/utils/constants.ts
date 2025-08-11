export const IMAGE_CONSTRAINTS = {
  MAX_WIDTH: 1200,
  SUPPORTED_FORMATS: [".jpg", ".jpeg", ".png"],
} as const;

export const ERROR_MESSAGES = {
  CANVAS_NOT_FOUND: "Canvas not found in useEffect",
  DOWNLOAD_NOT_PROCESSED: "Image Sharpening has not been processed yet.",
  DOWNLOAD_ERROR: "Error downloading image. Please try again.",
} as const;

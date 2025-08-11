export const IMAGE_CONSTRAINTS = {
  MAX_WIDTH: 1200,
  SUPPORTED_FORMATS: [".jpg", ".jpeg", ".png"],
} as const;

export const ERROR_MESSAGES = {
  CANVAS_NOT_FOUND: "Canvas not found in useEffect",
  DOWNLOAD_NOT_PROCESSED: "Image Sharpening has not been processed yet.",
  DOWNLOAD_ERROR: "Error downloading image. Please try again.",
  FILE_TYPE_INVALID: "Invalid file type. Please select an image file.",
  RESOURCES_UNAVAILABLE: "Required resources not available.",
  CANVAS_CONTEXT_FAILED: "Failed to get canvas context.",
  IMAGE_RESIZING_ERROR: "Error occurred while resizing image.",
  CANVAS_OPERATION_ERROR: "Error occurred during canvas operation.",
  WORKER_COMMUNICATION_ERROR: "Error occurred during image processing.",
  UNKNOWN_ERROR: "An unknown error occurred.",
  IMAGE_LOADING_ERROR: "Failed to load image.",
  IMAGE_PROCESSING_ERROR: "Error occurred during image processing.",
  CLEANUP_ERROR: "Error occurred during cleanup.",
} as const;

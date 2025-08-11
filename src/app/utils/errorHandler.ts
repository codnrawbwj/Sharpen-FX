import { ERROR_MESSAGES } from "@/app/utils/constants";

export const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);

  const userMessage = getErrorMessage(context);
  alert(userMessage);
};

const getErrorMessage = (context: string): string => {
  switch (context) {
    case "file handling":
      return ERROR_MESSAGES.FILE_TYPE_INVALID;
    case "image resizing":
      return ERROR_MESSAGES.IMAGE_RESIZING_ERROR;
    case "canvas operation":
      return ERROR_MESSAGES.CANVAS_OPERATION_ERROR;
    case "worker communication":
      return ERROR_MESSAGES.WORKER_COMMUNICATION_ERROR;
    case "download":
      return ERROR_MESSAGES.DOWNLOAD_ERROR;
    case "image loading":
      return ERROR_MESSAGES.IMAGE_LOADING_ERROR;
    case "image processing":
      return ERROR_MESSAGES.IMAGE_PROCESSING_ERROR;
    case "cleanup":
      return ERROR_MESSAGES.CLEANUP_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

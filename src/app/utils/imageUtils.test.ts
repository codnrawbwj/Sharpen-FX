import { describe, it, expect } from "vitest";
import { resizeImage } from "./imageUtils";

describe("imageUtils", () => {
  describe("resizeImage", () => {
    it("Need to reduce the size when the image is larger than the maximum width", () => {
      const mockImage = {
        width: 2000,
        height: 1500,
      } as HTMLImageElement;
      const maxWidth = 1000;

      const result = resizeImage(mockImage, maxWidth);

      expect(result.w).toBe(1000); // 너비가 1000으로 줄어들었는지
      expect(result.h).toBe(750); // 높이도 비례해서 줄어들었는지
    });

    it("Need to maintain the original size when the image is smaller than the maximum width", () => {
      const mockImage = {
        width: 500,
        height: 400,
      } as HTMLImageElement;
      const maxWidth = 1000;

      const result = resizeImage(mockImage, maxWidth);

      expect(result.w).toBe(500);
      expect(result.h).toBe(400);
    });

    it("Need to maintain the image ratio", () => {
      const mockImage = {
        width: 3000,
        height: 2000,
      } as HTMLImageElement;
      const maxWidth = 1500;

      const result = resizeImage(mockImage, maxWidth);

      const originalRatio = 3000 / 2000; // 1.5
      const newRatio = result.w / result.h; // 1500 / 1000 = 1.5

      expect(newRatio).toBeCloseTo(originalRatio, 2);
    });
  });
});

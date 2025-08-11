import { describe, it, expect, vi } from "vitest";
import { handleError } from "./errorHandler";

describe("errorHandler", () => {
  it("Need to check the default behavior", () => {
    const testError = new Error("Test Error");
    const context = "Test Context";

    const consoleSpy = vi.spyOn(console, "error");

    handleError(testError, context);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

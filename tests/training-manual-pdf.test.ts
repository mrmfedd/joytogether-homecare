import { describe, expect, it } from "vitest";
import { renderTrainingManualPdf } from "@/lib/training/render-training-manual-pdf";

describe("training manual PDF", () => {
  it("produces a valid PDF buffer", async () => {
    const buf = await renderTrainingManualPdf();
    expect(buf.length).toBeGreaterThan(10_000);
    expect(buf.subarray(0, 4).toString()).toBe("%PDF");
  });
});
import { describe, expect, it } from "vitest";
import { REPORT_CATEGORIES } from "@/lib/admin/reporting/build-export-payload";
import { renderReportXlsx } from "@/lib/admin/reporting/render-xlsx";
import { renderReportPdf } from "@/lib/admin/reporting/render-pdf";

const samplePayload = {
  category: "leads",
  categoryLabel: "Lead reports",
  periodLabel: "Jan 1, 2026 – Jan 31, 2026",
  generatedAt: "2026-01-15 10:00:00",
  filterSummary: "From 2026-01-01 to 2026-01-31",
  rows: [
    ["Metric", "Value"],
    ["Total leads (period)", "3"],
    ["Conversion rate %", "33.3"],
  ],
};

describe("report export categories", () => {
  it("defines seven reporting categories", () => {
    expect(REPORT_CATEGORIES).toHaveLength(7);
  });
});

describe("report file renderers", () => {
  it("produces a non-empty XLSX buffer", async () => {
    const buf = await renderReportXlsx(samplePayload);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 2).toString()).toBe("PK");
  });

  it("produces a valid PDF buffer", async () => {
    const buf = await renderReportPdf(samplePayload);
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.subarray(0, 4).toString()).toBe("%PDF");
  });
});

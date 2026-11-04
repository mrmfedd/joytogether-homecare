import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { ReportExportPayload } from "./build-export-payload";
import { site } from "@/content/site";

function addPageNumbers(doc: InstanceType<typeof PDFDocument>) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#526377").text(
      `Page ${i - range.start + 1} of ${range.count}`,
      doc.page.margins.left,
      doc.page.height - doc.page.margins.bottom + 10,
      { align: "center", width: doc.page.width - doc.page.margins.left - doc.page.margins.right },
    );
  }
}

export async function renderReportPdf(payload: ReportExportPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "LETTER" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const logoPath = path.join(process.cwd(), "public/assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 120 });
      doc.moveDown(3);
    }

    doc.fillColor("#061d45").fontSize(18).text(site.legalName, { align: "left" });
    doc.fontSize(14).fillColor("#0759ae").text(payload.categoryLabel);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#526377");
    doc.text(`Period: ${payload.periodLabel}`);
    doc.text(`Generated: ${payload.generatedAt}`);
    doc.text(`Filters: ${payload.filterSummary}`);
    doc.moveDown(1);

    const tableTop = doc.y;
    const col1 = doc.page.margins.left;
    const col2 = 320;
    const rowHeight = 20;

    doc.fontSize(10).fillColor("#061d45").font("Helvetica-Bold");
    doc.text(payload.rows[0][0], col1, tableTop, { width: 250 });
    doc.text(payload.rows[0][1], col2, tableTop, { width: 200 });
    doc.moveTo(col1, tableTop + 16).lineTo(doc.page.width - doc.page.margins.right, tableTop + 16).stroke("#d7e3ec");

    let y = tableTop + rowHeight;
    doc.font("Helvetica").fillColor("#061d45");

    for (const row of payload.rows.slice(1)) {
      if (y > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      doc.text(row[0], col1, y, { width: 250 });
      doc.text(row[1], col2, y, { width: 200 });
      y += rowHeight;
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#526377").text(
      `${site.legalName} · Confidential operations report · Not for patient clinical use`,
      { align: "center" },
    );

    addPageNumbers(doc);
    doc.end();
  });
}

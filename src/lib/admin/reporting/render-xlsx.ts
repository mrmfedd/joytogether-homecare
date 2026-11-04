import ExcelJS from "exceljs";
import type { ReportExportPayload } from "./build-export-payload";
import { site } from "@/content/site";

export async function renderReportXlsx(payload: ReportExportPayload): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = site.legalName;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Report", {
    views: [{ state: "frozen", ySplit: 6 }],
  });

  sheet.mergeCells("A1:B1");
  sheet.getCell("A1").value = site.legalName;
  sheet.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF0759AE" } };

  sheet.mergeCells("A2:B2");
  sheet.getCell("A2").value = payload.categoryLabel;
  sheet.getCell("A2").font = { bold: true, size: 12 };

  sheet.getCell("A3").value = "Reporting period";
  sheet.getCell("B3").value = payload.periodLabel;
  sheet.getCell("A4").value = "Generated";
  sheet.getCell("B4").value = payload.generatedAt;
  sheet.getCell("A5").value = "Filters";
  sheet.getCell("B5").value = payload.filterSummary;

  const headerRow = 7;
  sheet.getRow(headerRow).values = payload.rows[0];
  sheet.getRow(headerRow).font = { bold: true };
  sheet.getRow(headerRow).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEEF7FC" },
  };

  payload.rows.slice(1).forEach((row, i) => {
    sheet.getRow(headerRow + 1 + i).values = row;
  });

  sheet.columns = [{ width: 42 }, { width: 24 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { site } from "../../content/site";
import {
  TRAINING_MANUAL_DATE,
  TRAINING_MANUAL_VERSION,
  trainingManualChapters,
} from "./training-manual-content";

const ROYAL = "#0759ae";
const MIDNIGHT = "#061d45";
const MUTED = "#526377";

type Doc = InstanceType<typeof PDFDocument>;

function pageNumbers(doc: Doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor(MUTED)
      .text(
        `${site.legalName} · Training Manual v${TRAINING_MANUAL_VERSION} · Page ${i - range.start + 1} of ${range.count}`,
        doc.page.margins.left,
        doc.page.height - doc.page.margins.bottom + 12,
        { align: "center", width: doc.page.width - doc.page.margins.left - doc.page.margins.right },
      );
  }
}

function ensureRoom(doc: Doc, min = 72) {
  if (doc.y > doc.page.height - doc.page.margins.bottom - min) {
    doc.addPage();
  }
}

function sectionHeading(doc: Doc, text: string) {
  ensureRoom(doc, 48);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(ROYAL).text(text);
  doc.moveDown(0.35);
}

function subHeading(doc: Doc, text: string) {
  ensureRoom(doc, 40);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(MIDNIGHT).text(text);
  doc.moveDown(0.25);
}

function paragraph(doc: Doc, text: string) {
  ensureRoom(doc);
  doc.font("Helvetica").fontSize(10).fillColor(MIDNIGHT).text(text, { lineGap: 3, align: "left" });
  doc.moveDown(0.35);
}

function bulletList(doc: Doc, items: string[]) {
  const left = doc.page.margins.left + 12;
  const width = doc.page.width - doc.page.margins.right - left;
  for (const item of items) {
    ensureRoom(doc, 28);
    doc.font("Helvetica").fontSize(10).fillColor(MIDNIGHT);
    doc.text(`• ${item}`, left, doc.y, { width, lineGap: 2 });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.25);
}

function numberedList(doc: Doc, items: string[]) {
  const left = doc.page.margins.left + 8;
  const width = doc.page.width - doc.page.margins.right - left;
  items.forEach((item, idx) => {
    ensureRoom(doc, 28);
    doc.font("Helvetica").fontSize(10).fillColor(MIDNIGHT);
    doc.text(`${idx + 1}. ${item}`, left, doc.y, { width, lineGap: 2 });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.25);
}

export async function renderTrainingManualPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54, size: "LETTER" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const logoPath = path.join(process.cwd(), "public/assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 140 });
      doc.moveDown(4);
    }

    doc.font("Helvetica-Bold").fontSize(22).fillColor(MIDNIGHT).text("Staff Portal Training Manual", {
      align: "center",
    });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(12).fillColor(MUTED).text(site.legalName, { align: "center" });
    doc.fontSize(10).text(`Version ${TRAINING_MANUAL_VERSION} · ${TRAINING_MANUAL_DATE}`, { align: "center" });
    doc.moveDown(1.5);
    doc
      .fontSize(10)
      .fillColor(MIDNIGHT)
      .text(
        "Administrator Portal · Employee Portal · Security and operational checklists for classroom and field training.",
        { align: "center", lineGap: 4 },
      );

    doc.addPage();
    subHeading(doc, "Table of contents");
    trainingManualChapters.forEach((ch, i) => {
      doc.font("Helvetica").fontSize(10).fillColor(MIDNIGHT).text(`${i + 1}. ${ch.title}`);
    });

    for (const chapter of trainingManualChapters) {
      doc.addPage();
      sectionHeading(doc, chapter.title);
      for (const section of chapter.sections) {
        subHeading(doc, section.heading);
        section.paragraphs?.forEach((p) => paragraph(doc, p));
        if (section.bullets) bulletList(doc, section.bullets);
        if (section.numbered) numberedList(doc, section.numbered);
      }
    }

    doc.addPage();
    sectionHeading(doc, "Contact");
    paragraph(
      doc,
      `Questions about portal access: contact ${site.contact.email} or ${site.contact.phone}. For CPR and community training courses, visit ${site.url}/training.`,
    );
    doc.fontSize(9).fillColor(MUTED).text("Confidential internal training material. Not a substitute for agency policies or HIPAA training.", {
      lineGap: 3,
    });

    pageNumbers(doc);
    doc.end();
  });
}
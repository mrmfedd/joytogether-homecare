#!/usr/bin/env node
/**
 * Generates training manual PDF (CommonJS path — avoids tsx/pdfkit import issues).
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** @type {import('../src/lib/training/training-manual-content.ts')} */
const { trainingManualChapters, TRAINING_MANUAL_VERSION, TRAINING_MANUAL_DATE } = await import(
  "../src/lib/training/training-manual-content.ts"
);
const { site } = await import("../src/content/site.ts");

const OUT_DIR = path.join(root, "public/downloads");
const OUT_FILE = "joytogether-staff-portal-training-manual.pdf";

const ROYAL = "#0759ae";
const MIDNIGHT = "#061d45";
const MUTED = "#526377";

function ensureRoom(doc, min = 72) {
  if (doc.y > doc.page.height - doc.page.margins.bottom - min) doc.addPage();
}

function bulletList(doc, items) {
  const left = doc.page.margins.left + 12;
  const width = doc.page.width - doc.page.margins.right - left;
  for (const item of items) {
    ensureRoom(doc, 28);
    doc.font("Helvetica").fontSize(10).fillColor(MIDNIGHT).text(`• ${item}`, left, doc.y, { width, lineGap: 2 });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.25);
}

function numberedList(doc, items) {
  const left = doc.page.margins.left + 8;
  const width = doc.page.width - doc.page.margins.right - left;
  items.forEach((item, idx) => {
    ensureRoom(doc, 28);
    doc.font("Helvetica").fontSize(10).fillColor(MIDNIGHT).text(`${idx + 1}. ${item}`, left, doc.y, { width, lineGap: 2 });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.25);
}

const buf = await new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 54, size: "LETTER" });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  doc.on("error", reject);

  doc.font("Helvetica-Bold").fontSize(22).fillColor(MIDNIGHT).text("Staff Portal Training Manual", { align: "center" });
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(12).fillColor(MUTED).text(site.legalName, { align: "center" });
  doc.fontSize(10).text(`Version ${TRAINING_MANUAL_VERSION} · ${TRAINING_MANUAL_DATE}`, { align: "center" });
  doc.moveDown(1.5);
  doc
    .fontSize(10)
    .fillColor(MIDNIGHT)
    .text("Administrator Portal · Employee Portal · Security and operational checklists.", { align: "center" });

  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(11).fillColor(MIDNIGHT).text("Table of contents");
  doc.moveDown(0.5);
  trainingManualChapters.forEach((ch, i) => {
    doc.font("Helvetica").fontSize(10).text(`${i + 1}. ${ch.title}`);
  });

  for (const chapter of trainingManualChapters) {
    doc.addPage();
    ensureRoom(doc);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(ROYAL).text(chapter.title);
    doc.moveDown(0.5);
    for (const section of chapter.sections) {
      ensureRoom(doc, 40);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(MIDNIGHT).text(section.heading);
      doc.moveDown(0.25);
      section.paragraphs?.forEach((p) => {
        ensureRoom(doc);
        doc.font("Helvetica").fontSize(10).fillColor(MIDNIGHT).text(p, { lineGap: 3 });
        doc.moveDown(0.35);
      });
      if (section.bullets) bulletList(doc, section.bullets);
      if (section.numbered) numberedList(doc, section.numbered);
    }
  }

  doc.end();
});

mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, OUT_FILE);
writeFileSync(outPath, buf);
console.log(JSON.stringify({ ok: true, path: outPath, bytes: buf.length, publicUrl: `/downloads/${OUT_FILE}` }));
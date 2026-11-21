import PDFDocument from "pdfkit";
import { site } from "@/content/site";
import {
  PATIENT_CARE_MANUAL_DATE,
  PATIENT_CARE_MANUAL_VERSION,
  administratorManualSections,
  caregiverManualSections,
} from "@/lib/patient/patient-care-manual-content";

type Doc = InstanceType<typeof PDFDocument>;

function renderSections(doc: Doc, title: string, sections: { title: string; bullets: string[] }[]) {
  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(18).text(title, { align: "center" });
  doc.moveDown();
  for (const section of sections) {
    doc.font("Helvetica-Bold").fontSize(13).text(section.title);
    doc.moveDown(0.3);
    for (const bullet of section.bullets) {
      doc.font("Helvetica").fontSize(10).text(`• ${bullet}`, { indent: 12, lineGap: 2 });
    }
    doc.moveDown();
  }
}

export async function renderAdministratorPatientManualPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(20).text(site.legalName);
    doc.fontSize(14).text("Administrator Patient Care Manual");
    doc.font("Helvetica").fontSize(10).text(`Version ${PATIENT_CARE_MANUAL_VERSION} · ${PATIENT_CARE_MANUAL_DATE}`);
    doc.moveDown();
    doc.text("Screens reflect implemented routes: /admin/patients, assignments, notes, messages, alerts.");

    renderSections(doc, "Administrator workflows", administratorManualSections);
    doc.end();
  });
}

export async function renderCaregiverPatientManualPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(20).text(site.legalName);
    doc.fontSize(14).text("Caregiver Patient Care Manual");
    doc.font("Helvetica").fontSize(10).text(`Version ${PATIENT_CARE_MANUAL_VERSION} · ${PATIENT_CARE_MANUAL_DATE}`);
    doc.moveDown();
    doc.text("Use demonstration patients only in non-production environments.");

    renderSections(doc, "Caregiver workflows", caregiverManualSections);
    doc.end();
  });
}
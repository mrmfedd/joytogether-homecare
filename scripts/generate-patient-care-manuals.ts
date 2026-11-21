#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  renderAdministratorPatientManualPdf,
  renderCaregiverPatientManualPdf,
} from "../src/lib/patient/render-patient-care-manual-pdf";

const OUT_DIR = path.join(process.cwd(), "public/downloads");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const [adminBuf, caregiverBuf] = await Promise.all([
    renderAdministratorPatientManualPdf(),
    renderCaregiverPatientManualPdf(),
  ]);
  const adminPath = path.join(OUT_DIR, "joytogether-admin-patient-care-manual.pdf");
  const caregiverPath = path.join(OUT_DIR, "joytogether-caregiver-patient-care-manual.pdf");
  writeFileSync(adminPath, adminBuf);
  writeFileSync(caregiverPath, caregiverBuf);
  console.log(JSON.stringify({ ok: true, administrator: adminPath, caregiver: caregiverPath }));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
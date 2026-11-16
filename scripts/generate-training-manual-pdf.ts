#!/usr/bin/env npx tsx
/**
 * Writes a printable PDF staff training manual to public/downloads/.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderTrainingManualPdf } from "../src/lib/training/render-training-manual-pdf";

const OUT_DIR = path.join(process.cwd(), "public/downloads");
const OUT_FILE = "joytogether-staff-portal-training-manual.pdf";

async function main() {
  const buf = await renderTrainingManualPdf();
  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, OUT_FILE);
  writeFileSync(outPath, buf);
  console.log(
    JSON.stringify({
      ok: true,
      path: outPath,
      bytes: buf.length,
      publicUrl: `/downloads/${OUT_FILE}`,
    }),
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
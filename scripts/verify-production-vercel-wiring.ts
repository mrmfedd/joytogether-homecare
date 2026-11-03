#!/usr/bin/env npx tsx
/**
 * Verifies Vercel wiring via `vercel env ls` (no secret values).
 * Requires linked project and Vercel CLI auth.
 */
import { execSync } from "node:child_process";

const PREVIEW_MARKER = "ep-summer-band-bc49hrns";
const PREVIEW_PROJECT = "lucky-fire-28361357";

function ls(env: string): string {
  return execSync(`vercel env ls ${env} 2>&1`, { encoding: "utf8" });
}

function integrations(): string {
  return execSync("vercel integration list --all 2>&1", { encoding: "utf8" });
}

function hasVar(output: string, name: string, environment: string) {
  const lines = output.split("\n").filter((l) => l.includes(name) && l.includes(environment));
  return lines.length > 0;
}

const previewOut = ls("preview");
const productionOut = ls("production");

const required = [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "NEON_PROJECT_ID",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
];

const previewHas = Object.fromEntries(required.map((k) => [k, hasVar(previewOut, k, "Preview")]));
const productionHas = Object.fromEntries(required.map((k) => [k, hasVar(productionOut, k, "Production")]));

const previewOnlyDbOnPreview =
  required.every((k) => !hasVar(productionOut, k, "Preview")) &&
  required.every((k) => previewHas[k]);

const productionDbOnProduction = required.every((k) => productionHas[k]);

let integrationText = "";
try {
  integrationText = integrations();
} catch {
  integrationText = execSync("vercel integration list 2>&1", { encoding: "utf8" });
}

const prodResourceLinked =
  /joytogether-production\s+.*joytogether-homecare/.test(integrationText.replace(/\n/g, " "));
const previewResourceLinked =
  /joytogether-preview-db\s+.*joytogether-homecare/.test(integrationText.replace(/\n/g, " "));

const ok =
  previewOnlyDbOnPreview &&
  productionDbOnProduction &&
  prodResourceLinked &&
  previewResourceLinked;

console.log(
  JSON.stringify(
    {
      previewNeonMarkers: { hostMarker: PREVIEW_MARKER, projectId: PREVIEW_PROJECT },
      previewEnvVarsPresent: previewHas,
      productionEnvVarsPresent: productionHas,
      previewDbVarsPreviewScopedOnly: previewOnlyDbOnPreview,
      productionDbVarsProductionScoped: productionDbOnProduction,
      integrations: { joytogetherProductionLinked: prodResourceLinked, joytogetherPreviewDbLinked: previewResourceLinked },
      ok,
      note: "Does not read secret values; confirms Vercel scope and integration linkage.",
    },
    null,
    2,
  ),
);

if (!ok) process.exit(1);

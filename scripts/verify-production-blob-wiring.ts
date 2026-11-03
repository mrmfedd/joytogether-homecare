#!/usr/bin/env npx tsx
/**
 * Verifies Vercel Blob env scope (no secret values).
 */
import { execSync } from "node:child_process";

const PREVIEW_STORE_PREFIX = "store_FMcUTyuldxbS";
const PRODUCTION_STORE_PREFIX = "store_cWaOTDxwvXsK4nzH";

function ls(env: string): string {
  return execSync(`vercel env ls ${env} 2>&1`, { encoding: "utf8" });
}

function lineFor(output: string, name: string, environment: string) {
  return output.split("\n").find((l) => l.includes(name) && l.includes(environment));
}

const previewOut = ls("preview");
const productionOut = ls("production");

const previewBlob = {
  BLOB_STORE_ID: lineFor(previewOut, "BLOB_STORE_ID", "Preview"),
  BLOB_READ_WRITE_TOKEN: lineFor(previewOut, "BLOB_READ_WRITE_TOKEN", "Preview"),
};

const productionBlob = {
  BLOB_STORE_ID: lineFor(productionOut, "BLOB_STORE_ID", "Production"),
  BLOB_READ_WRITE_TOKEN: lineFor(productionOut, "BLOB_READ_WRITE_TOKEN", "Production"),
};

const previewHasBlob = Boolean(previewBlob.BLOB_STORE_ID && previewBlob.BLOB_READ_WRITE_TOKEN);
const productionHasBlob = Boolean(productionBlob.BLOB_STORE_ID && productionBlob.BLOB_READ_WRITE_TOKEN);

const previewStoreIdHint = previewBlob.BLOB_STORE_ID?.includes(PREVIEW_STORE_PREFIX) ?? false;
const productionStoreIdHint =
  productionBlob.BLOB_STORE_ID?.includes(PRODUCTION_STORE_PREFIX) ?? false;

const previewBlobNotOnProduction =
  !lineFor(productionOut, "BLOB_STORE_ID", "Preview") &&
  !lineFor(productionOut, "BLOB_READ_WRITE_TOKEN", "Preview");

const productionBlobNotOnPreview =
  !lineFor(previewOut, "BLOB_STORE_ID", "Production") &&
  !lineFor(previewOut, "BLOB_READ_WRITE_TOKEN", "Production");

const ok =
  previewHasBlob &&
  previewStoreIdHint &&
  previewBlobNotOnProduction &&
  productionBlobNotOnPreview &&
  (!productionHasBlob || productionStoreIdHint);

console.log(
  JSON.stringify(
    {
      previewHasBlobEnv: previewHasBlob,
      productionHasBlobEnv: productionHasBlob,
      previewUsesExpectedStorePrefix: previewStoreIdHint,
      productionUsesExpectedStorePrefix: productionHasBlob ? productionStoreIdHint : "(not connected yet)",
      previewBlobVarsPreviewScopedOnly: previewBlobNotOnProduction,
      productionBlobVarsNotOnPreview: productionBlobNotOnPreview,
      expectedProductionStoreName: "joytogether-production-media",
      ok,
      note: "Store ID lines are metadata only; tokens are never printed.",
    },
    null,
    2,
  ),
);

if (!ok) process.exit(1);

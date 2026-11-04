#!/usr/bin/env npx tsx
/** Provision all Preview Playwright QA accounts (Preview Neon only). */
import { spawnSync } from "child_process";

const root = process.cwd();
const scripts = [
  "provision-preview-qa-admin.ts",
  "provision-preview-qa-operator.ts",
  "provision-preview-qa-viewer.ts",
  "provision-preview-qa-employee.ts",
];

for (const name of scripts) {
  const r = spawnSync("npx", ["tsx", `${root}/scripts/${name}`], {
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("All Preview QA accounts provisioned under /tmp/jt-preview-env/");

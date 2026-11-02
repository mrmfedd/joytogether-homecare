/**
 * HTTP smoke checks against a deployed preview (no browser).
 * Usage: PREVIEW_URL=https://your-preview.vercel.app npm run test:preview-smoke
 */
const base = process.env.PREVIEW_URL?.replace(/\/$/, "");
if (!base) {
  console.error("Set PREVIEW_URL to the Vercel preview origin.");
  process.exit(1);
}

const expectDb = process.env.EXPECT_DB === "true";

const checks = [
  { path: "/", expectStatus: 200, label: "homepage" },
  { path: "/admin/login", expectStatus: 200, label: "admin login" },
  { path: "/contact", expectStatus: 200, label: "contact" },
  { path: "/services", expectStatus: 200, label: "services" },
  {
    path: "/api/health/db",
    expectStatus: expectDb ? 200 : 503,
    label: "database health",
    parseJson: true,
  },
];

let failed = 0;

for (const check of checks) {
  const url = `${base}${check.path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const ok = res.status === check.expectStatus;
    if (!ok) {
      console.error(`FAIL ${check.label}: ${url} → HTTP ${res.status} (expected ${check.expectStatus})`);
      failed += 1;
      continue;
    }
    if (check.parseJson) {
      const json = await res.json();
      const dbOk = expectDb ? json.database === "connected" : json.database === "unavailable";
      if (!dbOk) {
        console.error(`FAIL ${check.label}: unexpected body ${JSON.stringify(json)}`);
        failed += 1;
        continue;
      }
    }
    console.log(`OK   ${check.label} (${check.expectStatus})`);
  } catch (e) {
    console.error(`FAIL ${check.label}: ${e instanceof Error ? e.message : e}`);
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("Preview smoke passed.");

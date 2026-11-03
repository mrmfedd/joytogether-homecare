/**
 * Unauthorized-access probes against Preview (no credentials).
 * Usage: PREVIEW_URL=https://... node scripts/rc-security-probe.mjs
 */
const base = process.env.PREVIEW_URL?.replace(/\/$/, "");
if (!base) {
  console.error("PREVIEW_URL required");
  process.exit(1);
}

const probes = [
  { path: "/admin", expect: [307, 302, 401, 403], label: "admin root redirect/deny" },
  { path: "/admin/leads", expect: [307, 302, 401, 403], label: "admin leads" },
  { path: "/admin/media", expect: [307, 302, 401, 403], label: "admin media" },
  { path: "/admin/content", expect: [307, 302, 401, 403], label: "admin content" },
  { path: "/api/admin/media", expect: [401, 403], label: "api admin media list" },
  {
    path: "/api/admin/applications/00000000-0000-0000-0000-000000000001/resume",
    expect: [401, 403, 404],
    label: "resume download unauth",
  },
  { path: "/api/cron/notifications", method: "POST", expect: [401, 403, 405], label: "cron without secret" },
  { path: "/api/health/db", expect: [200], label: "db health public ok" },
];

let failed = 0;
for (const p of probes) {
  const res = await fetch(`${base}${p.path}`, {
    method: p.method || "GET",
    redirect: "manual",
  });
  const ok = p.expect.includes(res.status);
  console.log(`${ok ? "PASS" : "FAIL"} ${p.label}: HTTP ${res.status} (expect ${p.expect.join("|")})`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`Security probe failures: ${failed}`);
  process.exit(1);
}
console.log("Security probes passed.");

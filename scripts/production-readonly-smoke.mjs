#!/usr/bin/env node
/**
 * Read-only Production HTTP smoke (no form submissions, no auth secrets).
 * Usage: PRODUCTION_URL=https://www.joytogetherhomecare.com node scripts/production-readonly-smoke.mjs
 */
const base = (process.env.PRODUCTION_URL || "https://www.joytogetherhomecare.com").replace(/\/$/, "");

const paths = [
  { path: "/", label: "homepage", expect: 200 },
  { path: "/contact", label: "contact", expect: 200 },
  { path: "/services", label: "services", expect: 200 },
  { path: "/apply", label: "careers", expect: 200 },
  { path: "/staff-login", label: "staff-login", expect: 200 },
  { path: "/admin/login", label: "admin-login", expect: 200 },
  { path: "/employee/login", label: "employee-login", expect: 200 },
  { path: "/api/health/db", label: "db-health", expect: 200, json: true },
  { path: "/api/bootstrap-super-admin", label: "bootstrap-absent", expect: 404 },
  { path: "/api/admin/reports/export?category=leads&format=csv", label: "reports-export-unauth", expect: 401 },
];

const adminRoutes = [
  "/admin",
  "/admin/leads",
  "/admin/consultations",
  "/admin/consultations/calendar",
  "/admin/private-duty",
  "/admin/open-shifts",
  "/admin/time-off",
  "/admin/notices",
  "/admin/timesheets",
  "/admin/reports",
  "/admin/help",
  "/admin/help/manage",
];

const employeeRoutes = [
  "/employee/login",
  "/employee",
  "/employee/schedule",
  "/employee/open-shifts",
  "/employee/time-off",
  "/employee/notices",
  "/employee/time-clock",
  "/employee/help",
];

async function get(path, redirect = "follow") {
  const res = await fetch(`${base}${path}`, { redirect });
  let json;
  if (path.includes("/api/")) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }
  return { status: res.status, json, finalUrl: res.url };
}

async function main() {
  const results = [];
  for (const c of paths) {
    const r = await get(c.path);
    const ok = r.status === c.expect;
    results.push({ ...c, status: r.status, ok, json: c.json ? r.json : undefined });
  }

  for (const path of adminRoutes) {
    const r = await get(path, "manual");
    const ok = r.status === 307 || r.status === 302 || r.status === 308 || r.finalUrl.includes("/admin/login");
    results.push({ path, label: `admin-gate${path}`, status: r.status, ok, note: "unauth redirect to login expected" });
  }

  for (const path of employeeRoutes) {
    const r = await get(path, "manual");
    const ok =
      path === "/employee/login"
        ? r.status === 200
        : r.status === 307 ||
          r.status === 302 ||
          r.finalUrl.includes("/employee/login") ||
          r.finalUrl.includes("/admin/login");
    results.push({ path, label: `employee-gate${path}`, status: r.status, ok, finalUrl: r.finalUrl });
  }

  const failed = results.filter((x) => !x.ok);
  console.log(JSON.stringify({ base, ok: failed.length === 0, failed: failed.length, results }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

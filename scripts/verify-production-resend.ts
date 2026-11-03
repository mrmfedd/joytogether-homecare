#!/usr/bin/env npx tsx
/**
 * Production Resend verification (no secrets in stdout).
 * Loads JT_PROD_ENV_FILE or .env.production.local — never uses Preview keys for send test.
 */
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { config } from "dotenv";
import { site } from "../src/content/site";

function loadEnvFile(path: string) {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[m[1]] = val;
  }
  return env;
}

const envFile = process.env.JT_PROD_ENV_FILE?.trim();
if (envFile && existsSync(envFile)) {
  const fileEnv = loadEnvFile(envFile);
  if (fileEnv.RESEND_API_KEY) process.env.RESEND_API_KEY = fileEnv.RESEND_API_KEY;
  if (fileEnv.RESEND_FROM) process.env.RESEND_FROM = fileEnv.RESEND_FROM;
} else {
  config({ path: ".env.production.local", override: true });
}

const EXPECTED_FROM =
  process.env.EXPECTED_RESEND_FROM?.trim() ||
  "JoyTogether Home Care <notifications@joytogetherhomecare.com>";
const EXPECTED_DOMAIN = "joytogetherhomecare.com";
const RECIPIENT = site.contact.email;

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

type DomainRow = { name: string; status: string; region?: string };

async function main() {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  const report: Record<string, unknown> = {
    ok: false,
    recipient: RECIPIENT,
    expectedFromDisplay: "JoyTogether Home Care",
    expectedFromAddress: "notifications@joytogetherhomecare.com",
  };

  if (!key) {
    report.error =
      "RESEND_API_KEY missing — set on Vercel Production and supply JT_PROD_ENV_FILE (gitignored) or .env.production.local for API verification";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  if (!from) {
    report.error = "RESEND_FROM missing in .env.production.local (or set on Vercel Production)";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  report.apiKeyFingerprint = fingerprint(key);
  report.fromConfigured = true;
  report.fromUsesTeezByDesign = /teezbydesign/i.test(from);
  report.fromUsesJoyTogetherNotifications = /notifications@joytogetherhomecare\.com/i.test(from);
  report.fromMatchesAuthorizedSender =
    from === EXPECTED_FROM ||
    (/JoyTogether Home Care/i.test(from) && /notifications@joytogetherhomecare\.com/i.test(from));

  const fromMatch = from.match(/<([^>]+)>/);
  report.configuredSenderAddress = fromMatch ? fromMatch[1].toLowerCase() : from.toLowerCase();
  report.configuredSendingDomain = report.configuredSenderAddress.includes("@")
    ? String(report.configuredSenderAddress).split("@")[1]
    : null;

  if (report.fromUsesTeezByDesign) {
    report.error = "Production RESEND_FROM must not use teezbydesign.com";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const domainsRes = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const domainsJson = (await domainsRes.json().catch(() => ({}))) as {
    data?: DomainRow[];
    message?: string;
  };

  if (!domainsRes.ok) {
    report.domainsOk = false;
    report.domainsError = domainsJson.message || `HTTP ${domainsRes.status}`;
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const domains = domainsJson.data ?? [];
  const joyDomain = domains.find((d) => d.name === EXPECTED_DOMAIN);
  report.domainsListed = domains.map((d) => ({ name: d.name, status: d.status }));
  report.joytogetherDomainVerified = joyDomain?.status === "verified";

  if (!joyDomain || joyDomain.status !== "verified") {
    report.error = `Domain ${EXPECTED_DOMAIN} not verified in this Resend account`;
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const testSubject = `${site.name} — production email configuration test`;
  const testBody = [
    "This is an authorized non-sensitive configuration test.",
    `Sent at: ${new Date().toISOString()}`,
    "No patient data, invitations, or credentials are included.",
    "",
    site.legalName,
    site.url,
  ].join("\n");

  const sendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [RECIPIENT],
      subject: testSubject,
      text: testBody,
    }),
  });

  const sendJson = (await sendRes.json().catch(() => ({}))) as { id?: string; message?: string };
  report.testSendAccepted = sendRes.ok;
  report.testMessageId = sendJson.id ?? null;
  report.testSendError = sendRes.ok ? undefined : sendJson.message || `HTTP ${sendRes.status}`;

  if (sendJson.id) {
    const statusRes = await fetch(`https://api.resend.com/emails/${sendJson.id}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const statusJson = (await statusRes.json().catch(() => ({}))) as {
      last_event?: string;
      status?: string;
      message?: string;
    };
    report.resendLogLookupOk = statusRes.ok;
    report.resendDeliveryStatus =
      statusJson.last_event || statusJson.status || (statusRes.ok ? "accepted" : undefined);
    report.resendLogError = statusRes.ok ? undefined : statusJson.message || `HTTP ${statusRes.status}`;
  }

  report.ok =
    Boolean(report.fromMatchesAuthorizedSender) &&
    Boolean(report.joytogetherDomainVerified) &&
    Boolean(report.testSendAccepted);

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
  process.exit(1);
});

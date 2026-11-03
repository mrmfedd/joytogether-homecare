import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import pg from "pg";

const PRODUCTION_NEON_PROJECT = "weathered-term-63569834";
const PRODUCTION_HOST_MARKER = "ep-nameless-hall";
const PREVIEW_HOST_MARKER = "ep-summer-band";
const DEFAULT_EMAIL = "mrmfedd@gmail.com";

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  if (ha.length !== hb.length) return false;
  return timingSafeEqual(ha, hb);
}

function verifyProductionDatabaseUrl() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not configured.");
  const host = new URL(url).hostname;
  if (host.includes(PREVIEW_HOST_MARKER)) {
    throw new Error("Preview database URL is not allowed.");
  }
  const ok =
    host.includes(PRODUCTION_HOST_MARKER) ||
    process.env.NEON_PROJECT_ID === PRODUCTION_NEON_PROJECT;
  if (!ok) throw new Error("Production database identity check failed.");
  return { url, host };
}

export function assertBootstrapAuthorized(authorizationHeader: string | null) {
  if (process.env.VERCEL_ENV !== "production") {
    return { ok: false as const, status: 403, error: "Production only." };
  }
  if (process.env.ADMIN_BOOTSTRAP_ENABLED !== "true") {
    return { ok: false as const, status: 403, error: "Bootstrap is disabled." };
  }
  const provided = authorizationHeader?.replace(/^Bearer\s+/i, "").trim() ?? "";
  const expected =
    process.env.ADMIN_BOOTSTRAP_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "";
  if (!expected || expected.length < 32) {
    return { ok: false as const, status: 503, error: "Bootstrap authorization not configured." };
  }
  if (!provided || !safeEqual(provided, expected)) {
    return { ok: false as const, status: 401, error: "Unauthorized." };
  }
  return { ok: true as const };
}

export async function createProductionSuperAdminInvite(params?: {
  email?: string;
  baseUrl?: string;
}) {
  const email = (params?.email || process.env.ADMIN_INVITE_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const allowed = (process.env.ADMIN_BOOTSTRAP_ALLOWED_EMAILS || DEFAULT_EMAIL)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes(email)) {
    throw new Error("Email not allowlisted for bootstrap.");
  }

  const base = (params?.baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://www.joytogetherhomecare.com").replace(
    /\/$/,
    "",
  );
  const role = "SUPER_ADMIN";

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim();
  if (!resendKey || !resendFrom) {
    throw new Error("Resend is not configured.");
  }
  if (!/joytogetherhomecare\.com/i.test(resendFrom)) {
    throw new Error("RESEND_FROM must use joytogetherhomecare.com.");
  }

  const { url, host } = verifyProductionDatabaseUrl();
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const userRes = await client.query(`SELECT id FROM "User" WHERE email = $1`, [email]);
    if (userRes.rows[0]) {
      throw new Error("Account already exists.");
    }

    const pending = await client.query(
      `SELECT id FROM "AdminInvitation" WHERE email = $1 AND "acceptedAt" IS NULL AND "expiresAt" > NOW()`,
      [email],
    );
    if (pending.rows.length) {
      throw new Error("Pending invitation already exists.");
    }

    const burnedRows = await client.query(
      `SELECT id FROM "AdminInvitation" WHERE email = $1 AND "acceptedAt" IS NULL`,
      [email],
    );
    for (const row of burnedRows.rows) {
      const burned = createHash("sha256")
        .update(`burned-${row.id}-${randomBytes(16).toString("hex")}`)
        .digest("hex");
      await client.query(
        `UPDATE "AdminInvitation" SET "expiresAt" = $1, "tokenHash" = $2 WHERE id = $3`,
        [new Date(Date.now() - 60_000), burned, row.id],
      );
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashInviteToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);
    const invitationId = randomUUID();

    await client.query(
      `INSERT INTO "AdminInvitation" (id, email, role, "tokenHash", "expiresAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [invitationId, email, role, tokenHash, expiresAt],
    );

    const acceptUrl = `${base}/admin/accept-invite?token=${token}`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: resendFrom,
        to: [email],
        subject: "JoyTogether Home Care Admin invitation",
        text: [
          "You have been invited to JoyTogether Home Care Admin.",
          "",
          "Open this one-time link within 48 hours to set your password:",
          acceptUrl,
          "",
          "If you did not expect this email, ignore it.",
        ].join("\n"),
      }),
    });

    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      throw new Error(json.message || `Resend HTTP ${res.status}`);
    }

    return {
      ok: true as const,
      dbHost: host,
      neonProjectId: process.env.NEON_PROJECT_ID || PRODUCTION_NEON_PROJECT,
      email,
      role,
      invitationIdPrefix: invitationId.slice(0, 8),
      invitationExpiresAt: expiresAt.toISOString(),
      priorInvitesBurned: burnedRows.rows.length,
      resendAccepted: true,
      resendMessageId: json.id ?? null,
      resendFromUsesJoyTogetherDomain: true,
      resendFromUsesNotificationsAddress: /notifications@joytogetherhomecare\.com/i.test(resendFrom),
      adminLoginUrl: `${base}/admin/login`,
    };
  } finally {
    await client.end();
  }
}

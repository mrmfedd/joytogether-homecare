#!/usr/bin/env npx tsx
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { site } from "../src/content/site";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL required");
  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

async function main() {
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  if (!resendKey || !resendFrom) throw new Error("RESEND not configured");

  const pending = await prisma.notification.findMany({
    where: { status: "PENDING", type: "lead_created", attempts: { lt: 5 } },
    take: 20,
  });

  let sent = 0;
  for (const n of pending) {
    const payload = n.payload as {
      leadId: string;
      fullName: string;
      email: string;
      phone: string;
      careType: string;
      source: string;
      location?: string;
    };
    const text = [
      "New JoyTogether lead (retry)",
      `Lead ID: ${payload.leadId}`,
      `Name: ${payload.fullName}`,
      `Phone: ${payload.phone}`,
      `Email: ${payload.email}`,
      `Care interest: ${payload.careType}`,
    ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [site.contact.email],
        reply_to: payload.email,
        subject: `New lead — ${payload.careType}`,
        text,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    const attempts = n.attempts + 1;
    if (res.ok) {
      await prisma.notification.update({
        where: { id: n.id },
        data: { status: "SENT", attempts, lastError: null, sentAt: new Date() },
      });
      sent += 1;
    } else {
      await prisma.notification.update({
        where: { id: n.id },
        data: {
          status: attempts >= 5 ? "FAILED" : "PENDING",
          attempts,
          lastError: json.message || `HTTP ${res.status}`,
        },
      });
    }
  }
  console.log(`Retried ${pending.length}; newly sent ${sent}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

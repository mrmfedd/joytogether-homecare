import { NextResponse } from "next/server";
import { createLeadFromConsultation } from "@/lib/leads/create-lead";
import { consultationSchema } from "@/lib/validation/consultation";
import { dbHealthCheck } from "@/lib/prisma";

const recent = new Map<string, number[]>();

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = 8;
  const stamps = (recent.get(ip) || []).filter((t) => now - t < windowMs);
  if (stamps.length >= max) {
    recent.set(ip, stamps);
    return true;
  }
  stamps.push(now);
  recent.set(ip, stamps);
  return false;
}

export async function POST(req: Request) {
  try {
    const db = await dbHealthCheck();
    if (!db.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Our inquiry system is temporarily unavailable. Please call (813) 820-0337 or email joytogetherhomecare@gmail.com.",
        },
        { status: 503 },
      );
    }

    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later or call us." },
        { status: 429 },
      );
    }

    const json = await req.json();
    const parsed = consultationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid submission." },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const idempotencyKey =
      req.headers.get("idempotency-key")?.trim() || parsed.data.idempotencyKey;

    const { lead, created } = await createLeadFromConsultation({
      ...parsed.data,
      idempotencyKey,
    });

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      created,
      message: "Thank you. Your inquiry was received and our care team will follow up.",
    });
  } catch (e) {
    console.error("consultation_submit_failed", e instanceof Error ? e.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "Unexpected error. Please call (813) 820-0337." },
      { status: 500 },
    );
  }
}

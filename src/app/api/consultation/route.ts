import { NextResponse } from "next/server";
import { site } from "@/content/site";

export const runtime = "nodejs";

type Body = {
  source?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  careType?: string;
  preferredContact?: string;
  location?: string;
  callbackTime?: string;
  whoNeedsCare?: string;
  timing?: string;
  consent?: boolean;
  message?: string;
  website?: string; // honeypot
};

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

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later or call us." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as Body;

    // Honeypot — bots fill hidden fields
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const fullName = (body.fullName || "").trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").trim();
    const careType = (body.careType || "").trim();
    const preferredContact = (body.preferredContact || "").trim();
    const location = (body.location || "").trim();
    const consent = Boolean(body.consent);

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your full name." }, { status: 400 });
    }
    if (!phone || phone.length < 7) {
      return NextResponse.json({ ok: false, error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (!email || !isEmail(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!careType) {
      return NextResponse.json({ ok: false, error: "Please select a care type." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json(
        { ok: false, error: "Consent to be contacted is required." },
        { status: 400 },
      );
    }

    const text = [
      `New JoyTogether consultation inquiry`,
      `Source: ${body.source || "consultation-form"}`,
      `Name: ${fullName}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Care type: ${careType}`,
      `Preferred contact: ${preferredContact || "n/a"}`,
      `Location/ZIP: ${location || "n/a"}`,
      `Callback time: ${body.callbackTime || "n/a"}`,
      `Who needs care: ${body.whoNeedsCare || "n/a"}`,
      `Timing: ${body.timing || "n/a"}`,
      `Message: ${body.message || "n/a"}`,
      `Consent: yes`,
    ].join("\n");

    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (resendKey && resendFrom) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [site.contact.email],
          reply_to: email,
          subject: `JoyTogether inquiry — ${careType}`,
          text,
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error("Resend error", detail);
        return NextResponse.json(
          {
            ok: false,
            error:
              "We could not send your inquiry automatically. Please call (813) 820-0337 or email joytogetherhomecare@gmail.com.",
          },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, delivery: "email" });
    }

    // No email provider configured in this environment yet.
    console.info("Consultation inquiry (email provider not configured):\n", text);
    return NextResponse.json({
      ok: true,
      delivery: "logged",
      notice:
        "Inquiry accepted. Email delivery requires RESEND_API_KEY and RESEND_FROM to be configured for production notifications.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Unexpected error. Please call (813) 820-0337." },
      { status: 500 },
    );
  }
}

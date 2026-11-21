import { NextResponse } from "next/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { verifyPasskeyRegistration } from "@/lib/passkeys/service";
import { hasValidPasskeyReauth, clearPasskeyReauthCookie } from "@/lib/passkeys/reauth";

const bodySchema = z.object({
  response: z.custom<RegistrationResponseJSON>(),
  friendlyName: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!(await hasValidPasskeyReauth(session.user.id))) {
    return NextResponse.json({ error: "reauth_required" }, { status: 403 });
  }
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    await verifyPasskeyRegistration({
      userId: session.user.id,
      response: parsed.data.response,
      friendlyName: parsed.data.friendlyName,
    });
    await clearPasskeyReauthCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 400 });
  }
}
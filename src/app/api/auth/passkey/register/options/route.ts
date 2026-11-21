import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPasskeyRegistrationOptions } from "@/lib/passkeys/service";
import { hasValidPasskeyReauth } from "@/lib/passkeys/reauth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!(await hasValidPasskeyReauth(session.user.id))) {
    return NextResponse.json({ error: "reauth_required" }, { status: 403 });
  }
  try {
    const payload = await createPasskeyRegistrationOptions(session.user.id, session.user.email);
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 400 });
  }
}
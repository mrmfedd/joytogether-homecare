import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { verifyPasskeyReauthentication } from "@/lib/passkeys/reauth";

const bodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const ok = await verifyPasskeyReauthentication({
    userId: session.user.id,
    password: parsed.data.password,
  });

  if (!ok) {
    return NextResponse.json({ error: "reauth_failed" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
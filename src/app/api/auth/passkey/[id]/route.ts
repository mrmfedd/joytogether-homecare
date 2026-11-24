import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteUserPasskey } from "@/lib/passkeys/service";
import { hasValidPasskeyReauth } from "@/lib/passkeys/reauth";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!(await hasValidPasskeyReauth(session.user.id))) {
    return NextResponse.json({ error: "reauth_required" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    await deleteUserPasskey(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
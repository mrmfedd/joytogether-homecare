import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteUserPasskey } from "@/lib/passkeys/service";
import { hasValidPasskeyReauth } from "@/lib/passkeys/reauth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!(await hasValidPasskeyReauth(session.user.id))) {
    return NextResponse.json({ error: "reauth_required" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const remaining = await prisma.userPasskey.count({ where: { userId: session.user.id } });
  if (remaining <= 1) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, mfaEnabled: true },
    });
    if (user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN") && !user.mfaEnabled) {
      return NextResponse.json(
        { error: "last_second_factor" },
        { status: 400 },
      );
    }
  }

  try {
    await deleteUserPasskey(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
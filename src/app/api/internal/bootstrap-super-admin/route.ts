import { NextResponse } from "next/server";
import {
  assertBootstrapAuthorized,
  createProductionSuperAdminInvite,
} from "@/lib/admin/production-bootstrap-invite";

export const runtime = "nodejs";

/** One-time Production SUPER_ADMIN invite. Requires ADMIN_BOOTSTRAP_ENABLED=true and Bearer auth. */
export async function POST(req: Request) {
  const auth = assertBootstrapAuthorized(req.headers.get("authorization"));
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const result = await createProductionSuperAdminInvite();
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bootstrap failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}

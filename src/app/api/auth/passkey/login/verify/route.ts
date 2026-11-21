import { NextResponse } from "next/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { z } from "zod";
import { verifyPasskeyAuthentication } from "@/lib/passkeys/service";

const bodySchema = z.object({
  portal: z.enum(["admin", "employee"]),
  response: z.custom<AuthenticationResponseJSON>(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const result = await verifyPasskeyAuthentication(parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
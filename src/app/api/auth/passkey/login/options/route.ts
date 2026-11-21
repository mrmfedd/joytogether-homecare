import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasskeyAuthenticationOptions } from "@/lib/passkeys/service";

const bodySchema = z.object({
  email: z.string().email().optional(),
  portal: z.enum(["admin", "employee"]),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const payload = await createPasskeyAuthenticationOptions(parsed.data);
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
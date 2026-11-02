import { NextResponse } from "next/server";
import { processNotificationRetries } from "@/lib/notifications";

export async function POST(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const processed = await processNotificationRetries(50);
  return NextResponse.json({ ok: true, processed });
}

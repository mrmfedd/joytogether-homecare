import { NextResponse } from "next/server";
import { dbHealthCheck } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const result = await dbHealthCheck();
  return NextResponse.json(
    { database: result.ok ? "connected" : "unavailable", latencyMs: result.latencyMs },
    { status: result.ok ? 200 : 503 },
  );
}

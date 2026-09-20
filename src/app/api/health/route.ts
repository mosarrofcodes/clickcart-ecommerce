import { NextResponse } from "next/server";
import { db, withDbRetry } from "@/lib/db";

export const dynamic = "force-dynamic";

// Readiness probe used by the Playwright webServer.url + k8s-style liveness.
// Touching the DB here means Neon's scale-to-zero compute resumes during
// server boot (within the generous 120s webServer timeout) instead of during
// the first E2E test's 15s expectation window.
export async function GET() {
  try {
    await withDbRetry(() => db.$queryRaw`SELECT 1`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

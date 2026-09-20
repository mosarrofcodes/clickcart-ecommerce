import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cancelStalePendingOrders } from "@/lib/order-lifecycle";

/**
 * Vercel Cron endpoint. Configure in vercel.json — called daily; cancels
 * unpaid PENDING orders older than AUTO_CANCEL_PENDING_HOURS (default 24).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const expected = secret ? `Bearer ${secret}` : null;

  if (expected && auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!expected && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  const hours = Number(process.env.AUTO_CANCEL_PENDING_HOURS ?? 24) || 24;
  try {
    const cancelled = await cancelStalePendingOrders(hours);
    return NextResponse.json({ ok: true, cancelled });
  } catch (err) {
    console.error("Auto-cancel cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
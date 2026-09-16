import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function GET() {
  const { userId, error } = await requireUser();
  if (error) return error;

  try {
    const pref = await db.notificationPreference.findUnique({
      where: { userId: userId as string },
    });
    return NextResponse.json(
      pref ?? {
        emailOrderUpdates: true,
        emailPayment: true,
        emailMarketing: false,
        inAppEnabled: true,
      },
    );
  } catch (err) {
    console.error("Get notification preference error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const toBoolean = (v: unknown, fallback: boolean): boolean =>
    typeof v === "boolean" ? v : fallback;

  try {
    const pref = await db.notificationPreference.upsert({
      where: { userId: userId as string },
      create: {
        userId: userId as string,
        emailOrderUpdates: toBoolean(body.emailOrderUpdates, true),
        emailPayment: toBoolean(body.emailPayment, true),
        emailMarketing: toBoolean(body.emailMarketing, false),
        inAppEnabled: toBoolean(body.inAppEnabled, true),
      },
      update: {
        emailOrderUpdates: toBoolean(body.emailOrderUpdates, true),
        emailPayment: toBoolean(body.emailPayment, true),
        emailMarketing: toBoolean(body.emailMarketing, false),
        inAppEnabled: toBoolean(body.inAppEnabled, true),
      },
    });

    const { userId: _ignored, ...result } = pref;
    return NextResponse.json(result);
  } catch (err) {
    console.error("Update notification preference error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
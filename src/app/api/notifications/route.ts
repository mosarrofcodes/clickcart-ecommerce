import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function GET() {
  const { userId, error } = await requireUser();
  if (error) return error;

  try {
    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.count({
        where: { userId: userId as string, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("List notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let body: { id?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    if (typeof body.id === "string" && body.id) {
      await db.notification.updateMany({
        where: { id: body.id, userId: userId as string },
        data: { read: true },
      });
    } else {
      await db.notification.updateMany({
        where: { userId: userId as string, read: false },
        data: { read: true },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Mark notifications read error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
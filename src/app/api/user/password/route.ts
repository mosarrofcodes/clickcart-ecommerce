import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function PUT(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { currentPassword, newPassword } = body;

    if (typeof currentPassword !== "string" || !currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({ where: { id: userId as string } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
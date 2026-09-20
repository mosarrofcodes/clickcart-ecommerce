import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    let body: { token?: string; email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const token = typeof body.token === "string" ? body.token.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token || !email) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.resetToken ||
      user.resetToken !== token ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < new Date()
    ) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
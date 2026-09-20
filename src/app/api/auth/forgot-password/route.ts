import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    let body: { email?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await db.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your ClickCart password",
        html: passwordResetEmail(resetUrl),
      });
    } catch (err) {
      console.error("forgot-password email error:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
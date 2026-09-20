import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notification";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const fromName = name.trim();
    const fromEmail = email.trim();
    const subjectLine = `Contact: ${(subject as string)?.trim() || "New message"} — ${fromName}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
        <div style="background:#f97316;color:#fff;padding:16px 24px;font-size:18px">New Contact Form Message</div>
        <div style="padding:24px;color:#222;font-size:14px;line-height:1.6">
          <p><strong>Name:</strong> ${escapeHtml(fromName)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(fromEmail)}">${escapeHtml(fromEmail)}</a></p>
          ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(String(subject))}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:6px">${escapeHtml(String(message))}</p>
        </div>
      </div>
    `;

    const supportEmail =
      process.env.RESEND_FROM_EMAIL?.replace(/^.*<|>.*$/g, "") ??
      "support@clickcart.example";
    void sendEmail({ to: supportEmail, subject: subjectLine, html });

    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    for (const admin of admins) {
      await createNotification(admin.id, {
        type: "contact",
        title: "New contact message",
        body: `${fromName}: ${String(message).slice(0, 120)}`,
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
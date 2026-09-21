import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp, isHoneypot } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const rate = checkRateLimit(`newsletter:${getClientIp(req)}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (isHoneypot(body, "website")) {
    return NextResponse.json({ success: true });
  }

  if (!(await verifyTurnstile(body))) {
    return NextResponse.json(
      { error: "Please complete the security check and try again" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
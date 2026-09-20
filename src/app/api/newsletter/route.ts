import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
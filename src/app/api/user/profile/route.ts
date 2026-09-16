import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const user = await db.user.findUnique({
      where: { id: userId as string },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const { name, email } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (typeof email !== "string" || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const exists = await db.user.findFirst({
      where: { email: email.trim().toLowerCase(), id: { not: userId as string } },
    });
    if (exists) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    const user = await db.user.update({
      where: { id: userId as string },
      data: { name: name.trim(), email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: Request) {
  const rate = checkRateLimit(`login:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } },
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!(await verifyTurnstile(body))) {
      return NextResponse.json(
        { error: "Please complete the security check and try again" },
        { status: 400 }
      );
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({ message: "Logged in successfully" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
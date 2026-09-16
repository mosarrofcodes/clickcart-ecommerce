import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function requireUser(): Promise<{
  userId: string | null;
  error: NextResponse | null;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      userId: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId: session.user.id, error: null };
}
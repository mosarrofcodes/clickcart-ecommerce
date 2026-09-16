import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const withProducts = searchParams.get("withProducts") === "true";

    const include: Prisma.CategoryInclude = withProducts
      ? { products: { select: { id: true, title: true, image: true } } }
      : { _count: { select: { products: true } } };

    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      include,
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Category list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, slug, image = null, description = null } = body;

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 },
    );
  }

  const normalizedSlug = slug
    ? String(slug).trim()
    : String(name).trim().toLowerCase().replace(/\s+/g, "-");

  if (!normalizedSlug) {
    return NextResponse.json(
      { error: "A valid slug is required" },
      { status: 400 },
    );
  }

  try {
    const category = await db.category.create({
      data: {
        name: String(name),
        slug: normalizedSlug,
        image: image ? String(image) : null,
        description: description ? String(description) : null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 },
      );
    }
    console.error("Category create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
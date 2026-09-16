import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/categories/[slug]">,
) {
  try {
    const { slug } = await ctx.params;

    const category = await db.category.findUnique({
      where: { slug },
      include: {
        products: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/categories/[slug]">,
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { slug } = await ctx.params;

  const existing = await db.category.findFirst({
    where: { OR: [{ id: slug }, { slug }] },
  });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: Prisma.CategoryUpdateInput = {
    ...(body.name !== undefined ? { name: String(body.name) } : {}),
    ...(body.slug !== undefined ? { slug: String(body.slug).trim() } : {}),
    ...(body.image !== undefined
      ? { image: body.image ? String(body.image) : null }
      : {}),
    ...(body.description !== undefined
      ? { description: body.description ? String(body.description) : null }
      : {}),
  };

  if (!data.name && !data.slug && data.image === undefined && data.description === undefined) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 },
    );
  }

  try {
    const category = await db.category.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json(category);
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
    console.error("Category update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/categories/[slug]">,
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { slug } = await ctx.params;

  const existing = await db.category.findFirst({
    where: { OR: [{ id: slug }, { slug }] },
  });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const productCount = await db.product.count({
    where: { categoryId: existing.id },
  });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "Category has products — reassign or delete them first" },
      { status: 409 },
    );
  }

  try {
    await db.category.delete({ where: { id: existing.id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Category delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
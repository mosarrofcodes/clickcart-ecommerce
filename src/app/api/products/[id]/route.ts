import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    const { id } = await ctx.params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await ctx.params;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    body.price !== undefined &&
    (typeof body.price !== "number" || body.price <= 0)
  ) {
    return NextResponse.json(
      { error: "price must be a positive number" },
      { status: 400 },
    );
  }

  if (body.categoryId) {
    const category = await db.category.findUnique({
      where: { id: String(body.categoryId) },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
  }

  const data: Prisma.ProductUpdateInput = {
    ...(body.title !== undefined ? { title: String(body.title) } : {}),
    ...(body.description !== undefined
      ? { description: String(body.description) }
      : {}),
    ...(body.price !== undefined ? { price: Number(body.price) } : {}),
    ...(body.stock !== undefined ? { stock: Number(body.stock) || 0 } : {}),
    ...(body.image !== undefined ? { image: String(body.image) } : {}),
    ...(body.brand !== undefined
      ? { brand: body.brand ? String(body.brand) : null }
      : {}),
    ...(body.sku !== undefined ? { sku: String(body.sku) } : {}),
    ...(body.weight !== undefined
      ? { weight: typeof body.weight === "number" ? body.weight : null }
      : {}),
    ...(body.tags !== undefined
      ? { tags: Array.isArray(body.tags) ? body.tags.map(String) : [] }
      : {}),
    ...(body.categoryId !== undefined
      ? { category: { connect: { id: String(body.categoryId) } } }
      : {}),
  };

  try {
    const product = await db.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A product with this SKU already exists" },
        { status: 409 },
      );
    }
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await ctx.params;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
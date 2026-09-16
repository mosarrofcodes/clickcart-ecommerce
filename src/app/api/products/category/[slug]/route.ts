import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/products/category/[slug]">,
) {
  try {
    const { slug } = await ctx.params;
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 12),
    );

    const category = await db.category.findUnique({ where: { slug } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const where: Prisma.ProductWhereInput = { categoryId: category.id };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      category,
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Product by category error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
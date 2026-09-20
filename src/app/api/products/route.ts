import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";
import { getProducts, parseProductSearchParams } from "@/lib/product-query";

export async function GET(req: NextRequest) {
  try {
    const params = parseProductSearchParams(req.nextUrl.searchParams);
    const result = await getProducts(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Product list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

  const {
    title,
    description,
    price,
    oldPrice = null,
    stock = 0,
    image,
    brand = null,
    sku,
    weight = null,
    tags = [],
    categoryId,
    variants = [],
  } = body;

  if (!title || !description || !image || !sku || !categoryId) {
    return NextResponse.json(
      { error: "title, description, image, sku, and categoryId are required" },
      { status: 400 },
    );
  }

  if (typeof price !== "number" || price <= 0) {
    return NextResponse.json(
      { error: "price must be a positive number" },
      { status: 400 },
    );
  }

  const category = await db.category.findUnique({
    where: { id: String(categoryId) },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  try {
    const product = await db.product.create({
      data: {
        title: String(title),
        description: String(description),
        price,
        oldPrice:
          typeof oldPrice === "number" && oldPrice > price ? oldPrice : null,
        stock: Number(stock) || 0,
        image: String(image),
        brand: brand ? String(brand) : null,
        sku: String(sku),
        weight: typeof weight === "number" ? weight : null,
        tags: Array.isArray(tags) ? tags.map(String) : [],
        categoryId: String(categoryId),
        variants: {
          create: Array.isArray(variants)
            ? variants
                .filter(
                  (v): v is { name: string; price: number; stock: number; sku?: string | null } =>
                    Boolean(
                      v &&
                        typeof (v as Record<string, unknown>).name === "string" &&
                        typeof (v as Record<string, unknown>).price === "number",
                    ),
                )
                .map((v) => ({
                  name: v.name,
                  price: v.price,
                  stock: Number(v.stock) || 0,
                  sku: v.sku || null,
                }))
            : [],
        },
      },
      include: { category: true, variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
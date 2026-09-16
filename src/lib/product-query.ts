import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type ProductSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popular";

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Reviewed" },
];

export interface ProductQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export interface BuiltQuery {
  where: Prisma.ProductWhereInput;
  orderBy: Prisma.ProductOrderByWithRelationInput;
  skip: number;
  take: number;
  page: number;
  limit: number;
}

function sortOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "rating":
      return { rating: "desc" };
    case "popular":
      return { reviews: { _count: "desc" } };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export function parseProductSearchParams(
  searchParams: URLSearchParams,
): ProductQueryParams {
  const toNumber = (value: string | null, min: number, max: number): number | undefined => {
    if (!value) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : undefined;
  };

  const sort = searchParams.get("sort") as ProductSort | null;
  const sortValue = sort && PRODUCT_SORTS.some((s) => s.value === sort) ? sort : "newest";

  return {
    search: searchParams.get("q")?.trim() || searchParams.get("search")?.trim() || undefined,
    category: searchParams.get("category")?.trim() || undefined,
    brand: searchParams.get("brand")?.trim() || undefined,
    minPrice: toNumber(searchParams.get("minPrice"), 0, 1_000_000),
    maxPrice: toNumber(searchParams.get("maxPrice"), 0, 1_000_000),
    rating: toNumber(searchParams.get("rating"), 1, 5),
    inStock: searchParams.get("inStock") === "true",
    sort: sortValue,
    page: toNumber(searchParams.get("page"), 1, 1_000_000),
    limit: toNumber(searchParams.get("limit"), 1, 60),
  };
}

export function buildProductQuery(params: ProductQueryParams = {}): BuiltQuery {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort = "newest",
    page = 1,
    limit = 12,
  } = params;

  const price: Prisma.FloatFilter = {
    ...(minPrice !== undefined ? { gte: minPrice } : {}),
    ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
  };

  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          AND: [
            {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
              ],
            },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(brand ? { brand: { equals: brand, mode: "insensitive" } } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined ? { price } : {}),
    ...(rating !== undefined ? { rating: { gte: rating } } : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
  };

  return {
    where,
    orderBy: sortOrderBy(sort),
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

export async function getProducts(params: ProductQueryParams = {}) {
  const { where, orderBy, skip, take, page, limit } = buildProductQuery(params);

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { category: true },
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getDistinctBrands(): Promise<string[]> {
  const rows = await db.product.findMany({
    where: { brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows
    .map((r) => r.brand as string)
    .filter((brand, index, all) => brand && all.indexOf(brand) === index);
}
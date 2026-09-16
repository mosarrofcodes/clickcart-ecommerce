import {
  parseProductSearchParams,
  buildProductQuery,
  PRODUCT_SORTS,
} from "@/lib/product-query";

jest.mock("@/lib/db", () => ({ db: {} }));

const params = (values: Record<string, string>): URLSearchParams =>
  new URLSearchParams(values);

describe("parseProductSearchParams", () => {
  it("reads q and search as the query term", () => {
    expect(parseProductSearchParams(params({ q: "  phone  " })).search).toBe("phone");
    expect(parseProductSearchParams(params({ search: "laptop" })).search).toBe("laptop");
  });

  it("defaults to newest sort for unknown values", () => {
    expect(parseProductSearchParams(new URLSearchParams()).sort).toBe("newest");
    expect(parseProductSearchParams(params({ sort: "bogus" })).sort).toBe("newest");
  });

  it("accepts a valid sort value", () => {
    expect(parseProductSearchParams(params({ sort: "price_asc" })).sort).toBe(
      "price_asc",
    );
  });

  it("clamps numeric filters to their boundaries", () => {
    const result = parseProductSearchParams(
      params({ minPrice: "-5", maxPrice: "9999999", rating: "0", page: "0", limit: "999" }),
    );
    expect(result.minPrice).toBe(0);
    expect(result.maxPrice).toBe(1_000_000);
    expect(result.rating).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(60);
  });

  it("parses the inStock toggle", () => {
    expect(parseProductSearchParams(params({ inStock: "true" })).inStock).toBe(true);
    expect(parseProductSearchParams(new URLSearchParams()).inStock).toBe(false);
  });
});

describe("buildProductQuery", () => {
  it("combines search, category, brand and price filters", () => {
    const query = buildProductQuery({
      search: "phone",
      category: "gadgets",
      brand: "baseus",
      minPrice: 10,
      maxPrice: 50,
      rating: 4,
      inStock: true,
    });
    expect(query.where).toMatchObject({
      category: { slug: "gadgets" },
      brand: { equals: "baseus", mode: "insensitive" },
      price: { gte: 10, lte: 50 },
      rating: { gte: 4 },
      stock: { gt: 0 },
    });
    expect(query.where.AND).toBeDefined();
  });

  it("orders by the requested sort", () => {
    expect(buildProductQuery({ sort: "price_asc" }).orderBy).toEqual({ price: "asc" });
    expect(buildProductQuery({ sort: "rating" }).orderBy).toEqual({ rating: "desc" });
    expect(buildProductQuery({ sort: "popular" }).orderBy).toEqual({
      reviews: { _count: "desc" },
    });
    expect(buildProductQuery({ sort: "newest" }).orderBy).toEqual({ createdAt: "desc" });
  });

  it("computes skip/take for pagination", () => {
    expect(buildProductQuery({ page: 3, limit: 12 })).toMatchObject({
      skip: 24,
      take: 12,
      page: 3,
      limit: 12,
    });
  });

  it("stores label metadata for the UI", () => {
    expect(PRODUCT_SORTS).toHaveLength(5);
  });
});
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api";

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  return [headers.join(","), ...rows.map((row) => row.map(escape).join(","))].join("\r\n");
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const type = req.nextUrl.searchParams.get("type") ?? "orders";

  try {
    if (type === "orders") {
      const orders = await db.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } }, payment: true },
      });
      const csv = toCsv(
        [
          "Order ID",
          "Date",
          "Status",
          "Customer Phone",
          "District",
          "Items",
          "Subtotal",
          "Shipping",
          "Discount",
          "Total",
          "Payment Method",
          "Payment Status",
        ],
        orders.map((o) => [
          o.id,
          o.createdAt.toISOString(),
          o.status,
          o.phone,
          o.district,
          o._count.items,
          o.subtotal,
          o.shipping,
          o.discount,
          o.total,
          o.payment?.method,
          o.payment?.status,
        ]),
      );
      return csvResponse(csv, "clickcart-orders.csv");
    }

    if (type === "products") {
      const products = await db.product.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } }, _count: { select: { variants: true } } },
      });
      const csv = toCsv(
        [
          "Product ID",
          "Title",
          "SKU",
          "Category",
          "Brand",
          "Price",
          "Old Price",
          "Stock",
          "Variants",
          "Rating",
        ],
        products.map((p) => [
          p.id,
          p.title,
          p.sku,
          p.category.name,
          p.brand,
          p.price,
          p.oldPrice,
          p.stock,
          p._count.variants,
          p.rating,
        ]),
      );
      return csvResponse(csv, "clickcart-products.csv");
    }

    if (type === "customers") {
      const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
      const csv = toCsv(
        ["User ID", "Name", "Email", "Role", "Blocked", "Joined"],
        users.map((u) => [
          u.id,
          u.name,
          u.email,
          u.role,
          u.isBlocked ? "yes" : "no",
          u.createdAt.toISOString(),
        ]),
      );
      return csvResponse(csv, "clickcart-customers.csv");
    }

    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  } catch (err) {
    console.error("Report export error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function csvResponse(csv: string, filename: string): NextResponse {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
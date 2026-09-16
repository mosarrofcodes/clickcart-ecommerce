import { db } from "@/lib/db";
import type { OrderStatus } from "@/lib/order-status";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = status && VALID_STATUSES.has(status.toUpperCase()) ? status.toUpperCase() : "ALL";

  const orders = await db.order.findMany({
    where: validStatus === "ALL" ? {} : { status: validStatus as OrderStatus },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      items: {
        take: 1,
        select: { product: { select: { image: true, title: true } } },
      },
      _count: { select: { items: true } },
      payment: { select: { method: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Orders</h2>
        <p className="text-sm text-muted-foreground">
          {validStatus === "ALL" ? "All orders" : `Showing ${validStatus} orders`}
        </p>
      </div>
      <AdminOrdersTable
        currentStatus={validStatus}
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          itemCount: o._count.items,
          previewImage: o.items[0]?.product.image ?? null,
          previewTitle: o.items[0]?.product.title ?? null,
          user: o.user,
          paymentMethod: o.payment?.method ?? "—",
        }))}
      />
    </div>
  );
}
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/currency";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

const DAYS = 30;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function AdminReportsPage() {
  const since = daysAgo(DAYS);

  const [orders, topItems, lowStockCount, totalProducts, totalCustomers] =
    await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: since } },
        select: { status: true, total: true, createdAt: true },
      }),
      db.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 8,
      }),
      db.product.count({ where: { stock: { lte: 5 } } }),
      db.product.count(),
      db.user.count(),
    ]);

  const paid = orders.filter((o) => o.status !== "CANCELLED");
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = paid.length > 0 ? revenue / paid.length : 0;

  const statusCounts = new Map<string, number>();
  for (const o of orders) {
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
  }

  const productIds = topItems.map((t) => t.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true },
  });
  const titleMap = new Map(products.map((p) => [p.id, p.title]));

  const maxQty = Math.max(1, ...topItems.map((t) => t._sum.quantity ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Last {DAYS} days performance and store-wide totals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/api/admin/reports/export?type=orders">
              <Download className="w-4 h-4 mr-2" /> Orders CSV
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/api/admin/reports/export?type=products">
              <Download className="w-4 h-4 mr-2" /> Products CSV
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/api/admin/reports/export?type=customers">
              <Download className="w-4 h-4 mr-2" /> Customers CSV
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label={`Revenue (${DAYS}d)`} value={formatMoney(revenue)} />
        <Stat label={`Orders (${DAYS}d)`} value={String(orders.length)} />
        <Stat label="Avg. order value" value={formatMoney(avgOrder)} />
        <Stat label="Items sold (30d)" value={String(topItems.reduce((s, t) => s + (t._sum.quantity ?? 0), 0))} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Total products" value={String(totalProducts)} />
        <Stat label="Customers" value={String(totalCustomers)} />
        <Stat label="Low stock (≤5)" value={String(lowStockCount)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Order status breakdown</h3>
            <div className="space-y-2">
              {[...statusCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium capitalize">{status.toLowerCase()}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 rounded bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              {statusCounts.size === 0 && (
                <p className="text-sm text-muted-foreground">No orders in this period.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Top selling products</h3>
            <div className="space-y-3">
              {topItems.map((item) => {
                const qty = item._sum.quantity ?? 0;
                return (
                  <div key={item.productId} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium line-clamp-1">
                        {titleMap.get(item.productId) ?? item.productId}
                      </span>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        {qty} sold
                      </span>
                    </div>
                    <div className="h-2 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(qty / maxQty) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {topItems.length === 0 && (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { STATUS_COLORS, type OrderStatus } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, userCount, orderAgg, salesAgg, lowStock, recentOrders] =
    await Promise.all([
      db.product.count(),
      db.user.count(),
      db.order.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 8,
        select: { id: true, title: true, image: true, stock: true },
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          items: { take: 1, select: { product: { select: { image: true } } } },
        },
      }),
    ]);

  const stats = [
    { label: "Total Sales", value: `$${Number(salesAgg._sum.total ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "Orders", value: orderAgg, icon: ShoppingBag },
    { label: "Customers", value: userCount, icon: Users },
    { label: "Products", value: productCount, icon: Package },
  ];

  const revenueByDay = await revenueTrend();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border rounded-lg p-5 bg-background">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Icon className="w-4 h-4" />
              {label}
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border rounded-lg p-6 bg-background">
          <h2 className="text-lg font-bold mb-4">Revenue (last 14 days)</h2>
          <RevenueChart data={revenueByDay} />
        </section>

        <section className="space-y-6">
          <div className="border rounded-lg p-6 bg-background">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock
              </h2>
              <Link href="/admin/products" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products are well stocked.</p>
            ) : (
              <div className="space-y-2">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={36}
                      height={36}
                      className="w-9 h-9 object-cover rounded border"
                    />
                    <span className="flex-1 text-sm line-clamp-1">{p.title}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-6 bg-background">
            <h2 className="text-lg font-bold mb-3">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center gap-3 rounded-lg hover:bg-muted/50 p-2 -m-2"
                  >
                    {o.items[0]?.product.image ? (
                      <Image
                        src={o.items[0].product.image}
                        alt=""
                        width={36}
                        height={36}
                        className="w-9 h-9 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded border bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {o.user.name} — ${o.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status as OrderStatus] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {o.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

async function revenueTrend(): Promise<{ day: string; total: number }[]> {
  const days: { day: string; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const agg = await db.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: start, lt: end },
        status: { not: "CANCELLED" },
      },
    });
    days.push({
      day: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      total: Number(agg._sum.total ?? 0),
    });
  }
  return days;
}

function RevenueChart({ data }: { data: { day: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div>
      <div className="flex items-end gap-1 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div
              className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
              style={{ height: `${Math.max((d.total / max) * 100, d.total > 0 ? 4 : 1)}%` }}
              title={`$${d.total.toFixed(2)}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground truncate">
            {i % 2 === 0 ? d.day : ""}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <TrendingUp className="w-4 h-4" />
        Total revenue excludes cancelled orders
      </div>
    </div>
  );
}
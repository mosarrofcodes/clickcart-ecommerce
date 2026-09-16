import { db } from "@/lib/db";
import AdminCoupons from "@/components/admin/AdminCoupons";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Coupons</h2>
        <p className="text-sm text-muted-foreground">
          Create and manage discount coupons for customers
        </p>
      </div>
      <AdminCoupons coupons={coupons} />
    </div>
  );
}
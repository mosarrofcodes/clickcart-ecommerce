import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";
import AdminSettings from "@/components/admin/AdminSettings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, count] = await Promise.all([
    getSiteSettings(),
    db.order.count({ where: { status: "PENDING" } }),
  ]);

  return <AdminSettings settings={settings} pendingOrders={count} />;
}
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCheck, BellOff } from "lucide-react";
import MarkAllReadButton from "@/components/layout/MarkAllReadButton";

const TYPE_LABELS: Record<string, string> = {
  order: "Order",
  payment: "Payment",
  stock: "Stock",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function NotificationsPage() {
  const { userId, error } = await requireUser();
  if (error || !userId) redirect("/signin");

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <MarkAllReadButton />
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <BellOff className="w-10 h-10" />
          <p className="text-sm">You have no notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`border rounded-lg p-4 ${
                n.read ? "bg-background" : "bg-primary/5 border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {TYPE_LABELS[n.type] && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-primary border border-primary/20 rounded-full px-2 py-0.5">
                        {TYPE_LABELS[n.type]}
                      </span>
                    )}
                    <p className="font-medium text-sm">{n.title}</p>
                  </div>
                  {n.body && (
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                {n.link && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={n.link}>View</Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
import { db } from "@/lib/db";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Users</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} registered user{users.length === 1 ? "" : "s"}
        </p>
      </div>
      <AdminUsersTable users={users} />
    </div>
  );
}
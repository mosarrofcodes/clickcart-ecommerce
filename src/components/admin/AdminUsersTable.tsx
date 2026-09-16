"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  isBlocked: boolean;
}

export default function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function changeRole(id: string, role: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update role");
      toast.success("Role updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleBlock(user: AdminUser) {
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update user");
      toast.success(user.isBlocked ? "User unblocked" : "User blocked");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Select value={u.role} onValueChange={(role: string | null) => changeRole(u.id, role ?? u.role)}>
                    <SelectTrigger size="sm" aria-label="Change role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.isBlocked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant={u.isBlocked ? "outline" : "destructive"}
                      size="sm"
                      disabled={busyId === u.id}
                      onClick={() => toggleBlock(u)}
                    >
                      {busyId === u.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {u.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
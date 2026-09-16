import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShieldCheck, User as UserIcon } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ProfileForm from "@/components/profile/ProfileForm";
import AddressBook from "@/components/profile/AddressBook";
import NotificationPreferenceForm from "@/components/profile/NotificationPreferenceForm";

export const metadata: Metadata = { title: "My Profile | ClickCart" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [user, addresses] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true },
    }),
    db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    }),
  ]);

  if (!user) redirect("/signin");

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            user.role === "ADMIN"
              ? "bg-violet-100 text-violet-700"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {user.role === "ADMIN" ? (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ADMIN
            </span>
          ) : (
            "CUSTOMER"
          )}
        </span>
      </div>

      <div className="space-y-6">
        <ProfileForm user={user} />

        <AddressBook initialAddresses={addresses} />

        <NotificationPreferenceForm />

        <div className="border rounded-lg p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Order History</p>
              <p className="text-sm text-muted-foreground">
                Track and manage all your orders
              </p>
            </div>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            View Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
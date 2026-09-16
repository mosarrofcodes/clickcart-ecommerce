"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileNotificationsLink() {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.unreadCount != null) setCount(data.unreadCount);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <Link
      href="/notifications"
      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
    >
      <span className="relative">
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
            {count}
          </Badge>
        )}
      </span>
      <span>Notifications</span>
    </Link>
  );
}
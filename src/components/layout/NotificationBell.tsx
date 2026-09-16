"use client";

import { useSession } from "next-auth/react";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAuthed = status === "authenticated" && !!session?.user;

  const load = async () => {
    if (!isAuthed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok && data) {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // ignore — bell stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthed) return;
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthed) return null;

  const markAllRead = async () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch {
      // ignore
    }
  };

  const handleItemClick = async (n: AppNotification) => {
    if (!n.read) {
      setNotifications((list) =>
        list.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="hidden md:flex flex-col items-center h-auto py-1"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) void load();
        }}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <span className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </span>
        <span className="text-xs">Notifications</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-sm">Notifications</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
              <Link href="/notifications" onClick={() => setOpen(false)}>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  View all
                </button>
              </Link>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                Loading...
              </p>
            )}
            {!loading && notifications.length === 0 && (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                No notifications yet
              </p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "/notifications"}
                onClick={() => {
                  void handleItemClick(n);
                  setOpen(false);
                }}
                className={cn(
                  "block px-4 py-3 border-b last:border-b-0 hover:bg-muted/60 transition-colors",
                  !n.read && "bg-primary/5",
                )}
              >
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {n.body}
                  </p>
                )}
                {n.read && (
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Read
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
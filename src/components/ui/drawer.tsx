"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between border-b px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function DrawerClose({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className,
      )}
    >
      <X className="w-5 h-5" />
    </button>
  );
}

export function DrawerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border-t p-4 space-y-3", className)}>{children}</div>;
}
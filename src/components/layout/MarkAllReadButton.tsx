"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

export default function MarkAllReadButton() {
  const router = useRouter();

  const handleClick = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } finally {
      router.refresh();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={() => void handleClick()}>
      <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
    </Button>
  );
}
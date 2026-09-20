"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function GoogleSignInButton({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data: Record<string, unknown>) => {
        if (active) setEnabled(Boolean(data?.google));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        disabled={loading}
        onClick={() => {
          setLoading(true);
          signIn("google", { callbackUrl });
        }}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>
    </div>
  );
}
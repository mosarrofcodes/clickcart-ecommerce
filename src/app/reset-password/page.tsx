"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) toast.error("Invalid or missing reset link.");
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setResetting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} disabled required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input
          id="confirm"
          type="password"
          placeholder="Re-enter your new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={resetting}>
        {resetting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShoppingCart className="w-7 h-7 text-primary" />
            <span className="text-2xl font-bold text-primary">ClickCart</span>
          </div>

          <CardTitle className="text-2xl">Set a New Password</CardTitle>
          <p className="text-muted-foreground text-sm">
            Choose a strong password you don&apos;t use elsewhere.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Suspense fallback={<p className="text-center text-sm">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
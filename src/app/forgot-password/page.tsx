"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShoppingCart className="w-7 h-7 text-primary" />
            <span className="text-2xl font-bold text-primary">ClickCart</span>
          </div>

          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, a password
                reset link has been sent to your email. It will expire in 1 hour.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/signin">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-sm text-muted-foreground">
              Remembered your password?{" "}
              <Link
                href="/signin"
                className="text-primary font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
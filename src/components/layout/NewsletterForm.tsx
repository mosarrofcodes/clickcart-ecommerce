"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not subscribe. Please try again.");
        return;
      }
      setDone(true);
      setEmail("");
      toast.success("Subscribed! Watch your inbox for offers.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className="text-sm text-green-600">
        Thanks for subscribing — you&apos;re on the list!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="newsletter-email" className="text-sm font-medium">
        Subscribe to our newsletter
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="pl-9"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Get exclusive deals. No spam, unsubscribe anytime.
      </p>
    </form>
  );
}
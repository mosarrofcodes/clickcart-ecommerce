"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TurnstileCaptcha, {
  turnstileSiteKey,
} from "@/components/auth/TurnstileCaptcha";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [sending, setSending] = useState(false);
  const websiteRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (turnstileSiteKey && !captchaToken) {
      toast.error("Please complete the security check.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: websiteRef.current?.value ?? "",
          captchaToken: captchaToken ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send message.");
        return;
      }
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setCaptchaToken(null);
      setCaptchaNonce((n) => n + 1);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        ref={websiteRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={form.name} onChange={update("name")} placeholder="Full name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject (optional)</Label>
        <Input id="subject" value={form.subject} onChange={update("subject")} placeholder="Order issue, refund, question..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} value={form.message} onChange={update("message")} placeholder="How can we help?" />
      </div>
      <TurnstileCaptcha key={captchaNonce} onChange={setCaptchaToken} />

      <Button type="submit" disabled={sending}>
        {sending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        Send Message
      </Button>
    </form>
  );
}
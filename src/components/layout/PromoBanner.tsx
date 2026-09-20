"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Banner {
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  gradient: string;
  icon: string;
}

const BANNERS: Banner[] = [
  {
    title: "Flash Sale — Up to 40% Off",
    subtitle: "Grab today's hottest deals before they sell out.",
    href: "/offers",
    cta: "Shop Deals",
    gradient: "from-primary to-orange-500",
    icon: "⚡",
  },
  {
    title: "Cash on Delivery Nationwide",
    subtitle: "Pay when your order arrives. bKash, Nagad & Rocket also accepted.",
    href: "/payment-methods",
    cta: "See Payment Options",
    gradient: "from-emerald-600 to-teal-500",
    icon: "💵",
  },
  {
    title: "Free Delivery Inside Dhaka",
    subtitle: "On eligible orders above the minimum order value.",
    href: "/shipping-policy",
    cta: "Learn More",
    gradient: "from-violet-600 to-purple-500",
    icon: "🚚",
  },
];

export default function PromoBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[index];

  return (
    <section className="overflow-hidden rounded-2xl" aria-label="Promotions">
      <div
        className={cn(
          "bg-gradient-to-r relative text-white px-8 py-10 md:py-12 transition-colors duration-500",
          banner.gradient,
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <p className="text-4xl mb-3" aria-hidden>
              {banner.icon}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              {banner.title}
            </h2>
            <p className="text-white/90 mt-2 md:text-lg">{banner.subtitle}</p>
          </div>
          <Link
            href={banner.href}
            className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold rounded-lg px-5 py-3 hover:bg-white/90 transition-colors w-fit shrink-0"
          >
            {banner.cta} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex justify-center gap-2 py-3 bg-muted/40">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show promo ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40",
            )}
          />
        ))}
      </div>
    </section>
  );
}
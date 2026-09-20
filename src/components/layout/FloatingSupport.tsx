"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Phone, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_PHONE } from "@/lib/site";

function waLink() {
  const digits = SITE_PHONE.replace(/\D+/g, "");
  return `https://wa.me/${digits}`;
}

export default function FloatingSupport() {
  const [showTop, setShowTop] = useState(false);
  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/product/");

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed right-4 z-40 flex flex-col gap-3 items-end",
        isProductPage ? "bottom-24 md:bottom-4" : "bottom-4",
      )}
    >
      {showTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-background border rounded-full p-2.5 shadow-md hover:bg-muted transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center gap-2">
        <a
          href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
          className="hidden sm:flex items-center gap-1.5 bg-background border rounded-full pl-3 pr-4 py-2.5 shadow-md text-sm font-medium hover:bg-muted transition-colors"
        >
          <Phone className="w-4 h-4 text-primary" />
          {SITE_PHONE}
        </a>
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex items-center gap-1.5 bg-green-500 text-white rounded-full px-3.5 py-2.5 shadow-md hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
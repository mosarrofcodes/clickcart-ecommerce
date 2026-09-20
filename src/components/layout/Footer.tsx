import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { ReactNode } from "react";
import { MapPin, Phone, Mail, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import NewsletterForm from "@/components/layout/NewsletterForm";
import {
  SITE_PHONE,
  SITE_EMAIL,
  SITE_ADDRESS,
  SITE_SOCIAL,
} from "@/lib/site";

const PAYMENTS = [
  { label: "Cash on Delivery", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "bKash", className: "bg-pink-50 text-pink-700 border-pink-200" },
  { label: "Nagad", className: "bg-orange-50 text-orange-700 border-orange-200" },
  { label: "Rocket", className: "bg-purple-50 text-purple-700 border-purple-200" },
  { label: "Visa", className: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Mastercard", className: "bg-red-50 text-red-700 border-red-200" },
];

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      {/* Trust strip */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TrustItem
            icon={<Truck className="w-5 h-5 text-primary" />}
            title="Fast Delivery"
            desc="1–2 days inside Dhaka, 3–5 days nationwide"
          />
          <TrustItem
            icon={<ShieldCheck className="w-5 h-5 text-primary" />}
            title="Secure Payments"
            desc="SSLCommerz encrypted checkout"
          />
          <TrustItem
            icon={<RotateCcw className="w-5 h-5 text-primary" />}
            title="Easy Returns"
            desc="7-day return policy on eligible items"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">ClickCart</h2>
            <p className="text-sm text-muted-foreground">
              Trusted online shopping platform. Groceries, fashion, electronics
              and more with fast delivery across Bangladesh.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>{SITE_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <a
                  href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
                  className="hover:text-primary transition-colors"
                >
                  {SITE_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="hover:text-primary transition-colors"
                >
                  {SITE_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-primary transition-colors">
                  Special Offers
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-primary transition-colors">
                  Shop by Brand
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-primary transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return" className="hover:text-primary transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/payment-methods" className="hover:text-primary transition-colors">
                  Payment Methods
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Policies & Help</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="hover:text-primary transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-xl">
          <NewsletterForm />
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              We accept
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map((payment) => (
                <span
                  key={payment.label}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md border ${payment.className}`}
                >
                  {payment.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <a
                href={SITE_SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Facebook
              </a>
              <a
                href={SITE_SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Instagram
              </a>
              <a
                href={SITE_SOCIAL.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                YouTube
              </a>
            </div>
            <p>
              &copy; {new Date().getFullYear()} ClickCart. All rights reserved.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Designed and developed by{" "}
            <span className="font-medium text-foreground">Royhed Mosarrof</span>{" "}
            &bull; BSc in CSE, HSTU, Dinajpur, Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}

function TrustItem({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

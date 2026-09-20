import type { Metadata } from "next";
import type { ReactNode } from "react";
import InfoPage, { InfoSection, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Frequently Asked Questions | ClickCart",
  "Answers to the most common questions about ordering, payment, delivery and returns at ClickCart.",
);

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "How do I place an order?",
    a: "Add items to your cart, go to checkout, enter your shipping details, choose a payment method and confirm. You'll get a confirmation email and in-app notification right away.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Cash on delivery, bKash and all major cards (Visa, Mastercard) and local mobile-banking wallets via the SSLCommerz gateway.",
  },
  {
    q: "How long does delivery take?",
    a: "Inside Dhaka 1–2 working days, outside Dhaka 3–5 working days. See the Shipping Policy for details.",
  },
  {
    q: "Can I track my order?",
    a: "Yes — use the Track Order page with your order ID and phone number, or check the Orders page in your account.",
  },
  {
    q: "What is your return policy?",
    a: "You can return eligible items within 7 days of delivery. See the Return & Refund Policy for the full details.",
  },
  {
    q: "Are your products genuine?",
    a: "Yes. We source directly from brands and authorised distributors and perform quality checks before dispatch.",
  },
  {
    q: "What if I receive a faulty item?",
    a: "Contact us within 48 hours of delivery with photos. We'll arrange a replacement or full refund as quickly as possible.",
  },
  {
    q: "Do you offer EMI?",
    a: "Yes — eligible cards can split payment into monthly instalments at 0% interest on qualifying orders. Look for the EMI note on product and checkout pages.",
  },
];

export default function FaqPage() {
  return (
    <InfoPage title="Frequently Asked Questions" subtitle="Quick answers to common questions">
      {faqs.map(({ q, a }, index) => (
        <InfoSection key={q} heading={`${index + 1}. ${q}`}>
          <p>{a}</p>
        </InfoSection>
      ))}
    </InfoPage>
  );
}
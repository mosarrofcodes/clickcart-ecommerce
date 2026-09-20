import type { Metadata } from "next";
import InfoPage, { InfoSection, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata: Metadata = infoPageMetadata(
  "Shipping Policy | ClickCart",
  "ClickCart shipping policy — delivery times inside and outside Dhaka, charges and free-delivery threshold.",
);

export default function ShippingPolicyPage() {
  return (
    <InfoPage title="Shipping Policy" subtitle="How we deliver your orders across Bangladesh">
      <InfoSection heading="Delivery Areas">
        <p>
          ClickCart delivers to all 64 districts of Bangladesh. Standard
          courier delivery is handled by our trusted partner network of
          couriers.
        </p>
      </InfoSection>

      <InfoSection heading="Delivery Time">
        <ul className="list-disc list-inside space-y-2">
          <li>Inside Dhaka: 1–2 working days</li>
          <li>Outside Dhaka: 3–5 working days</li>
          <li>Remote areas / hill tracts: up to 7 working days</li>
        </ul>
        <p>
          Orders placed after 8:00 PM are processed the next business day.
          Delivery estimates start from the moment your order is confirmed.
        </p>
      </InfoSection>

      <InfoSection heading="Shipping Charges">
        <ul className="list-disc list-inside space-y-2">
          <li>Inside Dhaka: flat ৳80</li>
          <li>Outside Dhaka: flat ৳130</li>
          <li>Free delivery inside Dhaka on orders over ৳5,000</li>
        </ul>
        <p>
          Charges are calculated automatically at checkout based on your
          district.
        </p>
      </InfoSection>

      <InfoSection heading="Tracking">
        <p>
          You can check your order status anytime on the{" "}
          <a href="/track" className="text-primary hover:underline">
            Track Order
          </a>{" "}
          page using your order ID and phone number. A dispatch confirmation
          email is sent once your parcel leaves our warehouse.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
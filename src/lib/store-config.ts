import type { CouponType } from "@prisma/client";
import { CURRENCY_SYMBOL } from "@/lib/currency";

export interface SiteSettings {
  storeName: string;
  tagline: string;
  hotline: string;
  supportEmail: string;
  announcement: string;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  codMaxAmount: number;
  deliveryEstimateInside: string;
  deliveryEstimateOutside: string;
  currency: string;
  emiMonths: number;
  emiInterestRate: number;
}

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  storeName: "ClickCart",
  tagline: "Your one-stop online shop",
  hotline: "",
  supportEmail: "support@clickcart.example",
  announcement: "",
  shippingInsideDhaka: 80,
  shippingOutsideDhaka: 130,
  freeShippingThreshold: 5000,
  codEnabled: true,
  codMaxAmount: 50000,
  deliveryEstimateInside: "1-2 working days",
  deliveryEstimateOutside: "3-5 working days",
  currency: "BDT",
  emiMonths: 12,
  emiInterestRate: 0,
};

export const SITE_SETTING_KEYS = Object.keys(SITE_SETTINGS_DEFAULTS) as (
  | keyof SiteSettings
)[];

export type ProductSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popular";

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Reviewed" },
];

export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_COST = 80;

export interface ShippingParams {
  district?: string | null;
  insideDhaka?: number;
  outsideDhaka?: number;
  threshold?: number;
}

/** Core Dhaka-metro delivery zones eligible for inside-Dhaka rates & free shipping. */
const INSIDE_DHAKA_DISTRICTS = new Set([
  "dhaka",
  "dakshin dhaka",
  "uttar dhaka",
  "uttara",
  "savar",
  "narayanganj",
  "gazipur",
]);

export function isInsideDhaka(district?: string | null): boolean {
  if (!district) return true;
  const v = district.toLowerCase().trim();
  if (!v) return true;
  for (const d of INSIDE_DHAKA_DISTRICTS) {
    if (v === d) return true;
    if (v.startsWith(`${d} `)) return true;
  }
  return false;
}

/** District-aware shipping: free inside Dhaka above the threshold, flat fee outside Dhaka. */
export function computeShipping(
  subtotal: number,
  params: ShippingParams = {},
): number {
  const inside = params.insideDhaka ?? SHIPPING_COST;
  const outside = params.outsideDhaka ?? 130;
  const threshold = params.threshold ?? FREE_SHIPPING_THRESHOLD;

  if (isInsideDhaka(params.district)) {
    return subtotal >= threshold ? 0 : inside;
  }
  return outside;
}

/**
 * Standard reducing-balance EMI. `annualRate` is a percentage (0 = 0% EMI).
 * Returns the fixed monthly installment for `months`.
 */
export function computeEmi(
  principal: number,
  months: number,
  annualRate: number,
): number {
  if (!Number.isFinite(principal) || principal <= 0 || months < 1) return 0;
  const n = Math.round(months);
  const r = annualRate > 0 ? annualRate / 1200 : 0;
  if (r === 0) return Number((principal / n).toFixed(2));
  const factor = Math.pow(1 + r, n);
  return Number(((principal * r * factor) / (factor - 1)).toFixed(2));
}

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENT: "% off",
  FIXED: `${CURRENCY_SYMBOL} off`,
  FREESHIP: "Free shipping",
};
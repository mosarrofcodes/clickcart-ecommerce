export const SITE_NAME = "ClickCart";
export const SITE_DESCRIPTION =
  "ClickCart is your one-stop online shop for quality products — electronics, fashion, home goods and more with fast checkout and secure payments.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const SITE_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+880 1712-345678";
export const SITE_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@clickcart.com.bd";
export const SITE_ADDRESS =
  process.env.NEXT_PUBLIC_SITE_ADDRESS ??
  "House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh";

export const SITE_SOCIAL = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://youtube.com",
};

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
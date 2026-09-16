export const SITE_NAME = "ClickCart";
export const SITE_DESCRIPTION =
  "ClickCart is your one-stop online shop for quality products — electronics, fashion, home goods and more with fast checkout and secure payments.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
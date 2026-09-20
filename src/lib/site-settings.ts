import { db } from "@/lib/db";
import {
  computeEmi,
  isInsideDhaka,
  SITE_SETTING_KEYS,
  SITE_SETTINGS_DEFAULTS,
  type SiteSettings,
} from "@/lib/store-config";

export {
  computeEmi,
  isInsideDhaka,
  SITE_SETTING_KEYS,
  SITE_SETTINGS_DEFAULTS,
  type SiteSettings,
};

const CACHE_TTL_MS = 30_000;
let settingsCache: { at: number; settings: SiteSettings } | null = null;

const NUMBER_KEYS: (keyof SiteSettings)[] = [
  "shippingInsideDhaka",
  "shippingOutsideDhaka",
  "freeShippingThreshold",
  "codMaxAmount",
  "emiMonths",
  "emiInterestRate",
];

const BOOL_KEYS: (keyof SiteSettings)[] = ["codEnabled"];

function sanitize(raw: Record<string, string>): SiteSettings {
  const result = { ...SITE_SETTINGS_DEFAULTS } as SiteSettings;
  const out = result as unknown as Record<string, string | number | boolean>;
  for (const key of SITE_SETTING_KEYS) {
    const value = raw[key];
    if (value === undefined || value === null) continue;
    if (NUMBER_KEYS.includes(key)) {
      const num = Number(value);
      if (Number.isFinite(num) && num >= 0) out[key] = num;
    } else if (BOOL_KEYS.includes(key)) {
      out[key] = value === "true" || value === "1";
    } else {
      out[key] = String(value);
    }
  }
  return result;
}

/** Reads site settings from the database with a short in-memory cache. */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (process.env.NODE_ENV === "test") return SITE_SETTINGS_DEFAULTS;

  if (settingsCache && Date.now() - settingsCache.at < CACHE_TTL_MS) {
    return settingsCache.settings;
  }

  const rows = await db.siteSetting.findMany();
  const raw: Record<string, string> = {};
  for (const row of rows) raw[row.key] = row.value;

  const settings = sanitize(raw);
  settingsCache = { at: Date.now(), settings };
  return settings;
}

export async function saveSiteSettings(
  next: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const rows = await db.siteSetting.findMany();
  const raw: Record<string, string> = {};
  for (const row of rows) raw[row.key] = row.value;

  for (const key of SITE_SETTING_KEYS) {
    const value = next[key];
    if (value === undefined) continue;
    raw[key] =
      typeof value === "boolean" ? String(value) : String(value ?? "");
  }

  const settings = sanitize(raw);
  await Promise.all(
    Object.entries(raw).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  );

  settingsCache = { at: Date.now(), settings };
  return settings;
}

/** Convenience: monthly instalment using the persisted store settings. */
export async function emiForAmount(
  principal: number,
): Promise<{ months: number; rate: number; installment: number }> {
  const s = await getSiteSettings();
  return {
    months: s.emiMonths,
    rate: s.emiInterestRate,
    installment: computeEmi(principal, s.emiMonths, s.emiInterestRate),
  };
}
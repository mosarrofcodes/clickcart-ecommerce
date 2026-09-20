import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api";
import type { SiteSettings } from "@/lib/site-settings";
import {
  getSiteSettings,
  saveSiteSettings,
  SITE_SETTING_KEYS,
} from "@/lib/site-settings";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await getSiteSettings());
  } catch (err) {
    console.error("Get admin settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Partial<SiteSettings> = {};
  for (const key of SITE_SETTING_KEYS) {
    if (key in body) {
      const value = body[key];
      if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
        (patch as Record<string, unknown>)[key] = value;
      }
    }
  }

  try {
    const saved = await saveSiteSettings(patch);
    return NextResponse.json(saved);
  } catch (err) {
    console.error("Save admin settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
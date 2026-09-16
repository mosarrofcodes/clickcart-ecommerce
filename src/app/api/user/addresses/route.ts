import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/api";

export async function GET() {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    const addresses = await db.address.findMany({
      where: { userId: userId as string },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("List addresses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const REQUIRED_FIELDS = [
  "name",
  "phone",
  "address",
  "city",
  "district",
] as const;

export async function POST(req: Request) {
  try {
    const { userId, error } = await requireUser();
    if (error) return error;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    for (const field of REQUIRED_FIELDS) {
      if (typeof body[field] !== "string" || !(body[field] as string).trim()) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }
    if (
      body.zipCode != null &&
      typeof body.zipCode !== "string"
    ) {
      return NextResponse.json({ error: "Invalid postal code" }, { status: 400 });
    }

    const existing = await db.address.findFirst({
      where: { userId: userId as string },
    });

    const address = await db.address.create({
      data: {
        userId: userId as string,
        name: (body.name as string).trim(),
        phone: (body.phone as string).trim(),
        address: (body.address as string).trim(),
        city: (body.city as string).trim(),
        district: (body.district as string).trim(),
        zipCode: body.zipCode
          ? (body.zipCode as string).trim()
          : null,
        isDefault:
          body.isDefault === true
            ? true
            : existing
              ? false
              : true,
      },
    });

    if (address.isDefault) {
      await db.address.updateMany({
        where: { userId: userId as string, id: { not: address.id } },
        data: { isDefault: false },
      });
    }

    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    console.error("Create address error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
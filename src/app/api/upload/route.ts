import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/api";

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const result: { secure_url: string; public_id: string } = await new Promise(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "clickcart" },
          (error, res) => {
            if (error || !res) reject(error);
            else resolve(res as unknown as { secure_url: string; public_id: string });
          }
        );
        stream.end(bytes);
      }
    );

    return NextResponse.json(
      { url: result.secure_url, publicId: result.public_id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Check your Cloudinary configuration." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Image size must be under 8MB" }, { status: 400 });
    }

    const mime = file.type;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowed.includes(mime)) {
      return NextResponse.json(
        { success: false, error: "Invalid image format. Allowed: JPG, PNG, WebP, SVG, GIF." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeExt = ["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext) ? ext : "png";
    const filename = `bravon-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${safeExt}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload image";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

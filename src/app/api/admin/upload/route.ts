import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { verifyAdminSessionToken } from "@/lib/sessionToken";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!verifyAdminSessionToken(session?.value)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 35MB for images & videos)
    if (file.size > 35 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size must be under 35MB" }, { status: 400 });
    }

    const mime = file.type;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif", "video/mp4", "video/webm"];
    if (!allowed.includes(mime)) {
      return NextResponse.json(
        { success: false, error: "Invalid format. Allowed: JPG, PNG, WebP, SVG, GIF, MP4, WebM." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeExt = ["jpg", "jpeg", "png", "webp", "svg", "gif", "mp4", "webm"].includes(ext) ? ext : "png";
    const filename = `bravon-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Try Supabase Storage first if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data, error } = await supabase.storage
            .from("bravon-media")
            .upload(filename, buffer, {
              contentType: mime,
              upsert: true,
            });

          if (!error && data) {
            const { data: publicData } = supabase.storage
              .from("bravon-media")
              .getPublicUrl(filename);

            if (publicData?.publicUrl) {
              return NextResponse.json({
                success: true,
                url: publicData.publicUrl,
                filename,
                size: file.size,
                storage: "supabase",
              });
            }
          }
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload note, falling back to local:", storageErr);
      }
    }

    // 2. Local filesystem fallback (local dev)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      storage: "local",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload image";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

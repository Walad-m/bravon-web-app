import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readAuthConfig, writeAuthConfig } from "@/lib/adminAuth";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const authConfig = await readAuthConfig();
  return NextResponse.json({
    success: true,
    twoFactorEnabled: authConfig.twoFactorEnabled,
    sessionMaxAgeDays: authConfig.sessionMaxAgeDays || 7,
    securityLogs: authConfig.securityLogs || [],
  });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionMaxAgeDays, clearLogs } = await req.json();

    if (clearLogs) {
      await writeAuthConfig({ securityLogs: [] });
      return NextResponse.json({ success: true, message: "Security logs cleared" });
    }

    if (typeof sessionMaxAgeDays === "number") {
      await writeAuthConfig({ sessionMaxAgeDays });
      return NextResponse.json({ success: true, message: "Session preference updated" });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating security settings";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

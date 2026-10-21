import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminCredentials, readAuthConfig } from "@/lib/adminAuth";

export async function POST(req: Request) {
  try {
    const { password, twoFactorCode } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "localhost";
    const verification = await verifyAdminCredentials(password, twoFactorCode, ip);

    if (verification.requires2FA) {
      return NextResponse.json({
        success: false,
        requires2FA: true,
        message: verification.error || "Please enter the 6-digit code from your authenticator app",
      });
    }

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || "Incorrect admin password" },
        { status: 401 }
      );
    }

    const authConfig = await readAuthConfig();
    const sessionDays = authConfig.sessionMaxAgeDays || 7;

    const host = req.headers.get("host") || "";
    const isProdBravon = host.includes("bravoncity.com");

    const cookieStore = await cookies();
    cookieStore.set({
      name: "bravon_admin_session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * sessionDays,
      path: "/",
      domain: isProdBravon ? ".bravoncity.com" : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Signed in successfully",
      usedBackupCode: verification.usedBackupCode || false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

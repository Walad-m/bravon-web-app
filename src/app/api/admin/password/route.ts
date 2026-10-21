import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readAuthConfig, writeAuthConfig, verifyPassword, hashPassword, logSecurityEvent } from "@/lib/adminAuth";

const DEFAULT_FALLBACK_PASSWORD = process.env.ADMIN_PASSWORD || "bravon2026";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!session || session.value !== "authenticated") {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const config = await readAuthConfig();

    // Verify current password
    let currentValid = false;
    if (config.passwordHash && config.salt) {
      currentValid = verifyPassword(currentPassword, config.passwordHash, config.salt);
    } else {
      currentValid = currentPassword === DEFAULT_FALLBACK_PASSWORD;
    }

    if (!currentValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Hash and store new password
    const { hash, salt } = hashPassword(newPassword);
    await writeAuthConfig({
      passwordHash: hash,
      salt,
    });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "localhost";
    await logSecurityEvent("PASSWORD_CHANGED", "Admin password successfully changed", ip);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please use your new password for subsequent logins.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update password";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

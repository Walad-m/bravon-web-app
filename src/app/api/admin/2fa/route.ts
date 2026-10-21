import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  readAuthConfig,
  writeAuthConfig,
  generateBase32Secret,
  verifyTOTP,
  generateBackupCodes,
  verifyPassword,
  logSecurityEvent,
} from "@/lib/adminAuth";

const DEFAULT_FALLBACK_PASSWORD = process.env.ADMIN_PASSWORD || "bravon2026";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const wantsSetup = searchParams.get("setup") === "1";
  const authConfig = await readAuthConfig();

  if (wantsSetup) {
    const newSecret = generateBase32Secret(20);
    const issuer = "Bravon Store";
    const account = "admin@bravoncity.com";
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${newSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUrl)}&margin=10`;
    const backupCodes = generateBackupCodes();

    return NextResponse.json({
      success: true,
      enabled: authConfig.twoFactorEnabled,
      setup: {
        secret: newSecret,
        otpauthUrl,
        qrImageUrl,
        backupCodes,
      },
    });
  }

  return NextResponse.json({
    success: true,
    enabled: authConfig.twoFactorEnabled,
    backupCodesRemaining: authConfig.backupCodes?.length || 0,
  });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bravon_admin_session");

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "localhost";
    const authConfig = await readAuthConfig();

    if (action === "enable") {
      const { secret, code, backupCodes } = body;

      if (!secret || !code) {
        return NextResponse.json(
          { success: false, error: "Secret and verification code are required" },
          { status: 400 }
        );
      }

      // Verify the test code
      const isValid = verifyTOTP(secret, code);
      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid 6-digit code. Ensure your device clock is accurate and try again.",
          },
          { status: 400 }
        );
      }

      await writeAuthConfig({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: Array.isArray(backupCodes) ? backupCodes : generateBackupCodes(),
      });

      await logSecurityEvent("2FA_ENABLED", "Two-factor authentication enabled", ip);

      return NextResponse.json({
        success: true,
        message: "Two-factor authentication has been enabled successfully.",
      });
    }

    if (action === "disable") {
      const { password } = body;

      if (!password) {
        return NextResponse.json(
          { success: false, error: "Admin password is required to disable 2FA" },
          { status: 400 }
        );
      }

      let matches = false;
      if (authConfig.passwordHash && authConfig.salt) {
        matches = verifyPassword(password, authConfig.passwordHash, authConfig.salt);
      } else {
        matches = password === DEFAULT_FALLBACK_PASSWORD;
      }

      if (!matches) {
        return NextResponse.json(
          { success: false, error: "Incorrect admin password" },
          { status: 400 }
        );
      }

      await writeAuthConfig({
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
        backupCodes: [],
      });

      await logSecurityEvent("2FA_DISABLED", "Two-factor authentication disabled", ip);

      return NextResponse.json({
        success: true,
        message: "Two-factor authentication has been disabled.",
      });
    }

    if (action === "regenerate-backup-codes") {
      const { password } = body;

      let matches = false;
      if (authConfig.passwordHash && authConfig.salt) {
        matches = verifyPassword(password, authConfig.passwordHash, authConfig.salt);
      } else {
        matches = password === DEFAULT_FALLBACK_PASSWORD;
      }

      if (!matches) {
        return NextResponse.json(
          { success: false, error: "Incorrect admin password" },
          { status: 400 }
        );
      }

      const newCodes = generateBackupCodes();
      await writeAuthConfig({ backupCodes: newCodes });
      await logSecurityEvent("BACKUP_CODES_REGENERATED", "Backup codes regenerated", ip);

      return NextResponse.json({
        success: true,
        backupCodes: newCodes,
        message: "New emergency backup codes generated.",
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "2FA error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

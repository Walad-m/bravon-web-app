import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

const AUTH_FILE_PATH = path.join(process.cwd(), "src", "data", "admin-auth.json");
const TMP_AUTH_FILE_PATH = path.join("/tmp", "bravon-admin-auth.json");
const DEFAULT_FALLBACK_PASSWORD = process.env.ADMIN_PASSWORD || "bravon2026";

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  detail?: string;
  ip?: string;
}

export interface AdminAuthConfig {
  passwordHash?: string;
  salt?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  sessionMaxAgeDays: number;
  securityLogs: SecurityAuditLog[];
}

const DEFAULT_AUTH_CONFIG: AdminAuthConfig = {
  twoFactorEnabled: false,
  sessionMaxAgeDays: 7,
  securityLogs: [],
};

let memoryAuthConfig: AdminAuthConfig | null = null;

// Base32 Alphabet for TOTP (RFC 4648)
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(str: string): Buffer {
  const cleaned = str.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_CHARS.indexOf(cleaned[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

// RFC 6238 TOTP computation
export function calculateTOTP(secret: string, timeStepWindow = 0): string {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + timeStepWindow;
  const key = base32Decode(secret);

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(counterBuf);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const codeInt =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const code = (codeInt % 1000000).toString().padStart(6, "0");
  return code;
}

// Verify TOTP code with +/- 1 timestep window for clock drift
export function verifyTOTP(secret: string, token: string): boolean {
  const normalized = token.trim().replace(/\s+/g, "");
  if (normalized.length !== 6) return false;

  for (const window of [0, -1, 1, -2, 2]) {
    if (calculateTOTP(secret, window) === normalized) {
      return true;
    }
  }
  return false;
}

// Hash password with scrypt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, generatedSalt, 64);
  return { hash: derivedKey.toString("hex"), salt: generatedSalt };
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(hash, "hex");
    return crypto.timingSafeEqual(derivedKey, keyBuf);
  } catch {
    return false;
  }
}

// Generate 8 emergency backup codes
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}

// Read Auth Config
export async function readAuthConfig(): Promise<AdminAuthConfig> {
  // 1. Supabase check
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("admin_auth")
          .select("*")
          .eq("id", "primary")
          .single();

        if (!error && data) {
          const config: AdminAuthConfig = {
            passwordHash: data.password_hash || undefined,
            salt: data.salt || undefined,
            twoFactorEnabled: Boolean(data.two_factor_enabled),
            twoFactorSecret: data.two_factor_secret || undefined,
            backupCodes: data.backup_codes || [],
            sessionMaxAgeDays: Number(data.session_max_age_days || 7),
            securityLogs: data.security_logs || [],
          };
          memoryAuthConfig = config;
          return config;
        }
      }
    } catch (err) {
      console.warn("Supabase readAuthConfig warning:", err);
    }
  }

  if (memoryAuthConfig) return memoryAuthConfig;

  // 2. Local fallback
  try {
    const raw = await fs.readFile(AUTH_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    memoryAuthConfig = { ...DEFAULT_AUTH_CONFIG, ...parsed };
    return memoryAuthConfig!;
  } catch {}

  try {
    const raw = await fs.readFile(TMP_AUTH_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    memoryAuthConfig = { ...DEFAULT_AUTH_CONFIG, ...parsed };
    return memoryAuthConfig!;
  } catch {}

  return DEFAULT_AUTH_CONFIG;
}

// Write Auth Config
export async function writeAuthConfig(config: Partial<AdminAuthConfig>): Promise<AdminAuthConfig> {
  const current = await readAuthConfig();
  const merged: AdminAuthConfig = {
    ...current,
    ...config,
  };

  memoryAuthConfig = merged;

  // 1. Supabase sync
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from("admin_auth").upsert(
          {
            id: "primary",
            password_hash: merged.passwordHash || null,
            salt: merged.salt || null,
            two_factor_enabled: merged.twoFactorEnabled,
            two_factor_secret: merged.twoFactorSecret || null,
            backup_codes: merged.backupCodes || [],
            session_max_age_days: merged.sessionMaxAgeDays || 7,
            security_logs: merged.securityLogs || [],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        if (error) console.error("Supabase writeAuthConfig error:", error);
      }
    } catch (err) {
      console.error("Supabase writeAuthConfig exception:", err);
    }
  }

  // 2. Local fallback
  try {
    const dir = path.dirname(AUTH_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(AUTH_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to AUTH_FILE_PATH:", err);
  }

  try {
    await fs.writeFile(TMP_AUTH_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch {}

  return merged;
}

// Add security audit log
export async function logSecurityEvent(action: string, detail?: string, ip?: string) {
  const config = await readAuthConfig();
  const newEntry: SecurityAuditLog = {
    id: crypto.randomBytes(6).toString("hex"),
    timestamp: new Date().toISOString(),
    action,
    detail,
    ip,
  };

  // Keep last 50 logs
  const updatedLogs = [newEntry, ...(config.securityLogs || [])].slice(0, 50);
  await writeAuthConfig({ securityLogs: updatedLogs });
}

// Verify admin login attempt
export async function verifyAdminCredentials(
  passwordAttempt: string,
  twoFactorAttempt?: string,
  ip?: string
): Promise<{
  valid: boolean;
  requires2FA?: boolean;
  usedBackupCode?: boolean;
  error?: string;
}> {
  const config = await readAuthConfig();

  // 1. Check password
  let passwordMatches = false;
  if (config.passwordHash && config.salt) {
    passwordMatches = verifyPassword(passwordAttempt, config.passwordHash, config.salt);
  } else {
    // Fallback to environment variable or bravon2026
    passwordMatches = passwordAttempt === DEFAULT_FALLBACK_PASSWORD;
  }

  if (!passwordMatches) {
    await logSecurityEvent("FAILED_LOGIN_PASSWORD", "Invalid password attempted", ip);
    return { valid: false, error: "Incorrect admin password" };
  }

  // 2. Check 2FA if enabled
  if (config.twoFactorEnabled && config.twoFactorSecret) {
    if (!twoFactorAttempt || !twoFactorAttempt.trim()) {
      return { valid: false, requires2FA: true };
    }

    const cleanToken = twoFactorAttempt.trim().toUpperCase();

    // Check TOTP code
    const isTotpValid = verifyTOTP(config.twoFactorSecret, cleanToken);
    if (isTotpValid) {
      await logSecurityEvent("SUCCESSFUL_LOGIN", "Authenticated with TOTP 2FA", ip);
      return { valid: true };
    }

    // Check Backup Codes
    if (config.backupCodes && config.backupCodes.length > 0) {
      const formattedBackupCode = cleanToken.includes("-") ? cleanToken : `${cleanToken.slice(0, 4)}-${cleanToken.slice(4)}`;
      const index = config.backupCodes.indexOf(formattedBackupCode);
      if (index !== -1) {
        // Consume backup code
        const remaining = [...config.backupCodes];
        remaining.splice(index, 1);
        await writeAuthConfig({ backupCodes: remaining });
        await logSecurityEvent("SUCCESSFUL_LOGIN_BACKUP_CODE", `Used backup code ${formattedBackupCode}`, ip);
        return { valid: true, usedBackupCode: true };
      }
    }

    await logSecurityEvent("FAILED_LOGIN_2FA", "Invalid 2FA code entered", ip);
    return { valid: false, requires2FA: true, error: "Invalid two-factor code or backup code" };
  }

  await logSecurityEvent("SUCCESSFUL_LOGIN", "Authenticated with password", ip);
  return { valid: true };
}

import crypto from "crypto";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "bravon-secure-session-secret-change-in-env-at-least-32-chars";

export interface SessionPayload {
  role: "admin";
  created: number;
  expires: number;
}

/**
 * Creates a cryptographically signed HMAC SHA-256 session token
 */
export function createAdminSessionToken(maxAgeDays: number = 7): string {
  const now = Date.now();
  const expires = now + maxAgeDays * 24 * 60 * 60 * 1000;

  const payload: SessionPayload = {
    role: "admin",
    created: now,
    expires,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validates a session token:
 * 1. Checks HMAC signature integrity
 * 2. Checks token expiration
 * 3. Gracefully accepts legacy "authenticated" string in local development only
 */
export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;

  // In non-production local development, allow legacy string for backward compatibility
  if (process.env.NODE_ENV !== "production" && token === "authenticated") {
    return true;
  }

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, providedSig] = parts;

  try {
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    const expectedBuf = Buffer.from(expectedSig);
    const providedBuf = Buffer.from(providedSig);

    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }

    if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      return false;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (!payload.expires || payload.expires < Date.now()) {
      return false;
    }

    return payload.role === "admin";
  } catch {
    return false;
  }
}


import crypto from "crypto";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "tonalzone-secure-auth-secret-audiophile-iem-marketplace-2025";

/**
 * Hashes a password using PBKDF2 with salt.
 * Output format: pbkdf2:<salt>:<iterations>:<hexHash>
 */
export function hashPassword(password: string): string {
  const cleanPassword = (password || "").trim();
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 10000;
  const keylen = 32;
  const digest = "sha256";
  const hash = crypto.pbkdf2Sync(cleanPassword, salt, iterations, keylen, digest).toString("hex");
  return `pbkdf2:${salt}:${iterations}:${hash}`;
}

/**
 * Verifies a plain password against a stored hash or legacy hash format.
 * Supports:
 * 1. PBKDF2 format (pbkdf2:salt:iterations:hash)
 * 2. Legacy SHA-256 (64 hex characters)
 * 3. Seed plaintext fallback for legacy mock accounts
 */
export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash || !password) return false;
  const cleanPassword = password.trim();

  // 1. PBKDF2 salted hash verification
  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length === 4) {
      const [, salt, iterationsStr, originalHash] = parts;
      const iterations = parseInt(iterationsStr, 10) || 10000;
      const hash = crypto.pbkdf2Sync(cleanPassword, salt, iterations, 32, "sha256").toString("hex");
      try {
        return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
      } catch {
        return false;
      }
    }
  }

  // 2. Legacy SHA-256 hash verification
  if (storedHash.length === 64 && /^[0-9a-f]+$/i.test(storedHash)) {
    const sha = crypto.createHash("sha256").update(cleanPassword).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(sha), Buffer.from(storedHash));
    } catch {
      return false;
    }
  }

  // 3. Fallback comparison
  return storedHash === cleanPassword;
}

/**
 * Signs a session payload with HMAC-SHA256.
 * Result format: <base64urlPayload>.<signature>
 */
export function signSession(payload: unknown): string {
  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(base64Data).digest("hex");
  return `${base64Data}.${signature}`;
}

/**
 * Verifies and decodes a session cookie.
 * Supports:
 * 1. Standard signed token: <base64urlData>.<signature>
 * 2. Backward-compatible raw JSON string: {"id":...}
 */
export function verifySession<T = unknown>(token?: string | null): T | null {
  if (!token) return null;
  try {
    const decodedToken = decodeURIComponent(token).trim();

    // Format 1: Raw JSON session object (check first so strings containing '.' like emails/urls never get mishandled)
    if (decodedToken.startsWith("{") && decodedToken.endsWith("}")) {
      try {
        return JSON.parse(decodedToken) as T;
      } catch {
        return null;
      }
    }

    // Format 2: Signed token format: <base64urlData>.<64-hex-signature>
    const lastDotIndex = decodedToken.lastIndexOf(".");
    if (lastDotIndex > 0) {
      const base64Data = decodedToken.slice(0, lastDotIndex);
      const signature = decodedToken.slice(lastDotIndex + 1);

      if (signature.length === 64 && /^[0-9a-fA-F]+$/.test(signature)) {
        const expectedSignature = crypto.createHmac("sha256", AUTH_SECRET).update(base64Data).digest("hex");
        const sigBuf = Buffer.from(signature, "hex");
        const expBuf = Buffer.from(expectedSignature, "hex");

        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
          return JSON.parse(jsonStr) as T;
        } else {
          console.warn("[Auth Security] Invalid session signature detected.");
          return null;
        }
      }
    }
  } catch (err) {
    console.error("[Auth Security] Failed to verify session:", err);
  }
  return null;
}

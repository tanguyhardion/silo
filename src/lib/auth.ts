// Password gate — stateless signed session cookie (HMAC-SHA256 via Web Crypto).
// Required env: APP_PASSWORD (digits only) and AUTH_SECRET (long random string).
// Changing either one invalidates every existing session.

export const SESSION_COOKIE = "silo_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds
export const PASSWORD_PATTERN = /^\d{4,32}$/;

const encoder = new TextEncoder();

function getSecrets(): { password: string; secret: string } | null {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  // Fail closed: without proper configuration nobody gets in
  if (!password || !PASSWORD_PATTERN.test(password)) return null;
  if (!secret || secret.length < 32) return null;
  return { password, secret };
}

export function isAuthConfigured(): boolean {
  return getSecrets() !== null;
}

async function hmac(key: string, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array | null {
  try {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

// Signing key binds sessions to the current password as well as the secret
const signingKey = (s: { password: string; secret: string }) => `${s.secret}:${s.password}`;

export async function checkPassword(candidate: unknown): Promise<boolean> {
  const secrets = getSecrets();
  if (!secrets || typeof candidate !== "string" || !PASSWORD_PATTERN.test(candidate)) {
    return false;
  }
  // Compare HMAC digests so the comparison is constant-time and length-independent
  const [a, b] = await Promise.all([
    hmac(secrets.secret, `pw:${candidate}`),
    hmac(secrets.secret, `pw:${secrets.password}`),
  ]);
  return timingSafeEqual(a, b);
}

export async function createSessionToken(): Promise<string> {
  const secrets = getSecrets();
  if (!secrets) throw new Error("Authentification non configurée.");
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `v1.${exp}`;
  const sig = await hmac(signingKey(secrets), `session:${payload}`);
  return `${payload}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secrets = getSecrets();
  if (!secrets || !token || token.length > 200) return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1" || !/^\d{1,12}$/.test(parts[1])) return false;

  const exp = parseInt(parts[1], 10);
  if (exp < Math.floor(Date.now() / 1000)) return false;

  const given = fromBase64Url(parts[2]);
  if (!given) return false;
  const expected = await hmac(signingKey(secrets), `session:v1.${exp}`);
  return timingSafeEqual(given, expected);
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

// ---------------------------------------------------------------------------
// Brute-force protection — per-IP lockout. In-memory, so it is per server
// instance; the added delay and a long PIN are what make guessing impractical.
// ---------------------------------------------------------------------------
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function getLockoutRemaining(ip: string): number {
  const entry = attempts.get(ip);
  if (!entry) return 0;
  if (Date.now() > entry.resetAt) {
    attempts.delete(ip);
    return 0;
  }
  return entry.count >= MAX_ATTEMPTS ? entry.resetAt - Date.now() : 0;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + LOCKOUT_MS });
  } else {
    entry.count++;
  }
  // Keep the map bounded
  if (attempts.size > 10_000) {
    for (const [key, val] of attempts) if (now > val.resetAt) attempts.delete(key);
  }
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

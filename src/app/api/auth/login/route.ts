import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  clearAttempts,
  createSessionToken,
  getClientIp,
  getLockoutRemaining,
  isAuthConfigured,
  recordFailedAttempt,
  sessionCookieOptions,
} from "@/lib/auth";

const FAILURE_DELAY_MS = 800;

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: "Accès non configuré sur le serveur." },
      { status: 503 }
    );
  }

  // Only accept same-origin submissions
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ success: false, error: "Origine refusée." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const lockedFor = getLockoutRemaining(ip);
  if (lockedFor > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Trop de tentatives. Réessayez dans ${Math.ceil(lockedFor / 60000)} min.`,
      },
      { status: 429 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    password = null;
  }

  if (!(await checkPassword(password))) {
    recordFailedAttempt(ip);
    await new Promise((r) => setTimeout(r, FAILURE_DELAY_MS));
    return NextResponse.json({ success: false, error: "Code incorrect." }, { status: 401 });
  }

  clearAttempts(ip);
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
  return res;
}

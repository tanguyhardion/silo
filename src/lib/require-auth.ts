import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Second line of defense behind proxy.ts — call at the top of every API handler.
// Returns a 401 response when the request is not authenticated, null otherwise.
export async function requireAuth(): Promise<NextResponse | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return null;
  return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
}

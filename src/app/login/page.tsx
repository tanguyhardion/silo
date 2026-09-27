import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Accès",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const raw = Array.isArray(next) ? next[0] : next;
  // Only allow same-site relative paths (blocks open redirects like //evil.com)
  const redirectTo =
    raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/";

  return <LoginForm redirectTo={redirectTo} />;
}

import { NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function parseBooleanEnvFlag(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return null;
  }
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return null;
}

function isAdminOnlyModeEnabled() {
  const explicit = parseBooleanEnvFlag(process.env.ADMIN_ONLY_MODE);
  if (explicit !== null) {
    return explicit;
  }

  return process.env.NODE_ENV !== "production";
}

function shouldSkipAdminOnlyRedirect(pathname) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/") ||
    pathname === "/manifest.webmanifest"
  );
}

export async function middleware(request) {
  if (isAdminOnlyModeEnabled() && !shouldSkipAdminOnlyRedirect(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)",
  ],
};

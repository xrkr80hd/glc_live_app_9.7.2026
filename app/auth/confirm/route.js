import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/public-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RECOVERY_COOKIE_KEY = "lc_member_recovery";

function redirectTo(request, path) {
  return NextResponse.redirect(buildAuthUrl(request, path));
}

function normalizeType(value) {
  return String(value || "").trim().toLowerCase();
}

function resolveSafeNext(nextValue, fallback) {
  const next = String(nextValue || "").trim();
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

function getDefaultNextByType(type) {
  if (type === "recovery") {
    return "/member-access/reset-password";
  }
  if (type.startsWith("email_change")) {
    return "/member-access?emailChanged=1";
  }
  return "/member-access?verified=1";
}

function isHttpsRequest(request) {
  const forwardedProto = String(request.headers.get("x-forwarded-proto") || "")
    .toLowerCase()
    .split(",")[0]
    .trim();
  if (forwardedProto) {
    return forwardedProto === "https";
  }
  return new URL(request.url).protocol === "https:";
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = normalizeType(requestUrl.searchParams.get("type"));
  const next = resolveSafeNext(requestUrl.searchParams.get("next"), getDefaultNextByType(type));

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return redirectTo(request, "/member-access?error=verification");
  }

  let authError = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    authError = error;
  } else {
    authError = new Error("Missing verification token.");
  }

  if (authError) {
    if (type === "recovery") {
      return redirectTo(request, "/member-access/reset-password?error=verification");
    }
    return redirectTo(request, "/member-access?error=verification");
  }

  // Keep the recovery session so member can submit a new password immediately.
  if (type !== "recovery") {
    await supabase.auth.signOut();
    const response = redirectTo(request, next);
    response.cookies.set(RECOVERY_COOKIE_KEY, "", {
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const response = redirectTo(request, next);
  response.cookies.set(RECOVERY_COOKIE_KEY, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsRequest(request),
    maxAge: 15 * 60,
    path: "/",
  });
  return response;
}

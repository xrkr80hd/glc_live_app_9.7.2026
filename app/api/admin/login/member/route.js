import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  getAdminUpgradeSessionFromMemberCookies,
  isAdminAuthConfigured,
} from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getSafeNextPath(value, fallback = "/admin") {
  const normalized = String(value || "").trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }
  return normalized;
}

async function touchMemberLastLogin(memberId) {
  if (!memberId) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  await supabase
    .from("team_members")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", memberId);
}

function buildUnauthorizedPayload() {
  return {
    success: false,
    message: "Your current member account is not eligible for admin access.",
  };
}

export async function POST() {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: "Admin auth is not configured.",
      },
      { status: 500 },
    );
  }

  const upgradeSession = await getAdminUpgradeSessionFromMemberCookies();
  if (!upgradeSession) {
    return NextResponse.json(buildUnauthorizedPayload(), { status: 401 });
  }

  const token = createAdminSessionToken(upgradeSession.username, {
    memberId: upgradeSession.memberId,
    isSuperuser: upgradeSession.isSuperuser,
    source: upgradeSession.source || "member_session",
  });

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to create admin session.",
      },
      { status: 500 },
    );
  }

  await touchMemberLastLogin(upgradeSession.memberId);

  const response = NextResponse.json({
    success: true,
    username: upgradeSession.username,
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
  return response;
}

export async function GET(request) {
  const safeNext = getSafeNextPath(new URL(request.url).searchParams.get("next"), "/admin");
  const loginUrl = new URL("/admin/login?error=member-upgrade", request.url);

  if (!isAdminAuthConfigured()) {
    return NextResponse.redirect(loginUrl);
  }

  const upgradeSession = await getAdminUpgradeSessionFromMemberCookies();
  if (!upgradeSession) {
    return NextResponse.redirect(loginUrl);
  }

  const token = createAdminSessionToken(upgradeSession.username, {
    memberId: upgradeSession.memberId,
    isSuperuser: upgradeSession.isSuperuser,
    source: upgradeSession.source || "member_session",
  });

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  await touchMemberLastLogin(upgradeSession.memberId);

  const response = NextResponse.redirect(new URL(safeNext, request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
  return response;
}

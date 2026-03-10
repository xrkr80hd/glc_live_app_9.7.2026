import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  isAdminAuthConfigured,
  verifyAdminCredentials,
  verifyTeamMemberCredentials,
} from "@/lib/admin-auth";
import { readJsonBody } from "@/lib/admin-api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: "Admin auth is not configured. Set ADMIN_SESSION_SECRET and either env admin credentials or DB team-member logins.",
      },
      { status: 500 },
    );
  }

  const { data, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const username = String(data?.username || "").trim();
  const password = String(data?.password || "");

  if (!username || !password) {
    return NextResponse.json(
      {
        success: false,
        message: "Username and password are required.",
      },
      { status: 400 },
    );
  }

  const envLoginValid = verifyAdminCredentials(username, password);
  const dbLoginSession = envLoginValid ? null : await verifyTeamMemberCredentials(username, password);

  if (!envLoginValid && !dbLoginSession) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid username or password.",
      },
      { status: 401 },
    );
  }

  const sessionUsername = dbLoginSession?.username || username;
  const token = createAdminSessionToken(sessionUsername, {
    memberId: dbLoginSession?.memberId || null,
    isSuperuser: dbLoginSession?.isSuperuser ?? true,
    source: dbLoginSession?.source || "env",
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

  if (dbLoginSession?.memberId) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      await supabase
        .from("team_members")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", dbLoginSession.memberId);
    }
  }

  const response = NextResponse.json({
    success: true,
    username: sessionUsername,
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
  return response;
}

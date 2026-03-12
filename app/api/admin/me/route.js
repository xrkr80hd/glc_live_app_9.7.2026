import { NextResponse } from "next/server";
import { getAdminSessionFromRequest, isAdminAuthConfigured } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMemberRoles } from "@/lib/admin-role-access";

export async function GET(request) {
  const session = getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
        configured: isAdminAuthConfigured(),
      },
      { status: 401 },
    );
  }

  let roles = [];
  if (session.memberId) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      roles = await getMemberRoles(supabase, session.memberId);
    }
  }

  return NextResponse.json({
    authenticated: true,
    configured: true,
    session: {
      username: session.username,
      expiresAt: session.exp,
      memberId: session.memberId || null,
      isSuperuser: Boolean(session.isSuperuser),
      source: session.source || "env",
      roles,
      roleKeys: roles
        .map((role) => String(role.role_key || "").trim().toLowerCase())
        .filter(Boolean),
    },
  });
}

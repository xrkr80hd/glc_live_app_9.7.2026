import { NextResponse } from "next/server";
import { getAdminSessionFromRequest, isAdminAuthConfigured } from "@/lib/admin-auth";

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

  return NextResponse.json({
    authenticated: true,
    configured: true,
    session: {
      username: session.username,
      expiresAt: session.exp,
      memberId: session.memberId || null,
      isSuperuser: Boolean(session.isSuperuser),
      source: session.source || "env",
    },
  });
}

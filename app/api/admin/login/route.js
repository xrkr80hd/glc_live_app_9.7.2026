import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  isAdminAuthConfigured,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { readJsonBody } from "@/lib/admin-api";

export async function POST(request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: "Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.",
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

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid username or password.",
      },
      { status: 401 },
    );
  }

  const token = createAdminSessionToken(username);
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to create admin session.",
      },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    success: true,
    username,
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());
  return response;
}


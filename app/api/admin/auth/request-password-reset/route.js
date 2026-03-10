import crypto from "crypto";
import { NextResponse } from "next/server";
import { hashPasswordResetToken } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .slice(0, 80);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function getResetTtlMinutes() {
  const ttl = Number.parseInt(process.env.ADMIN_RESET_TOKEN_TTL_MINUTES || "60", 10);
  if (!Number.isFinite(ttl) || ttl < 10) {
    return 60;
  }
  return ttl;
}

function shouldReturnDebugResetLink() {
  return process.env.ADMIN_DEBUG_RESET_LINKS === "true" || process.env.NODE_ENV !== "production";
}

function buildResetUrl(request, token) {
  const requestUrl = new URL(request.url);
  const base = process.env.ADMIN_RESET_URL_BASE || `${requestUrl.origin}/admin/reset-password`;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}token=${encodeURIComponent(token)}`;
}

async function sendResetEmail({ to, resetUrl }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.ADMIN_MAIL_FROM;
  if (!resendApiKey || !from || !to || !resetUrl) {
    return { sent: false, reason: "Email provider not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Liberty Church Admin Password Reset",
      text: `Use this link to reset your admin password: ${resetUrl}`,
      html: `<p>Use this link to reset your admin password:</p><p><a href=\"${resetUrl}\">Reset Password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return { sent: false, reason: payload?.message || "Unable to send reset email" };
  }

  return { sent: true, reason: "" };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const identifier = String(body?.identifier || body?.email || body?.username || "").trim();

  if (!identifier) {
    return NextResponse.json({ success: false, message: "Email or username is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: "Supabase admin client is not configured." }, { status: 500 });
  }

  const isEmailIdentifier = identifier.includes("@");
  const normalizedEmail = normalizeEmail(identifier);
  const normalizedUsername = normalizeUsername(identifier);

  let member = null;
  if (isEmailIdentifier) {
    const { data } = await supabase
      .from("team_members")
      .select("id, username, email, is_active")
      .eq("email", normalizedEmail)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    member = data || null;
  } else {
    const { data } = await supabase
      .from("team_members")
      .select("id, username, email, is_active")
      .eq("username", normalizedUsername)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    member = data || null;
  }

  let debugResetUrl = "";

  if (member?.id && member?.email) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + getResetTtlMinutes() * 60 * 1000).toISOString();
    const resetUrl = buildResetUrl(request, token);

    await supabase.from("team_member_password_resets").insert({
      member_id: member.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      request_ip: request.headers.get("x-forwarded-for") || null,
    });

    await sendResetEmail({
      to: member.email,
      resetUrl,
    });

    debugResetUrl = resetUrl;
  }

  const payload = {
    success: true,
    message: "If that account exists, a password reset email has been sent.",
  };

  if (debugResetUrl && shouldReturnDebugResetLink()) {
    payload.resetUrl = debugResetUrl;
  }

  return NextResponse.json(payload);
}

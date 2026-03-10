import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "glc_admin_session";

function getSessionTtlSeconds() {
  const days = Number.parseInt(process.env.ADMIN_SESSION_TTL_DAYS || "7", 10);
  if (!Number.isFinite(days) || days < 1) {
    return 7 * 24 * 60 * 60;
  }
  return days * 24 * 60 * 60;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function toBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input) {
  const normalized = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64").toString("utf8");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function signPayload(payloadBase64) {
  const secret = getSessionSecret();
  if (!secret) {
    return "";
  }
  return crypto.createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

function parseCookieHeader(cookieHeader) {
  const header = String(cookieHeader || "");
  const parts = header.split(";").map((part) => part.trim());
  const map = {};
  for (const part of parts) {
    if (!part) continue;
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    map[key] = value;
  }
  return map;
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminUsername() && getAdminPassword() && getSessionSecret());
}

export function verifyAdminCredentials(username, password) {
  if (!isAdminAuthConfigured()) {
    return false;
  }
  return safeEqual(username, getAdminUsername()) && safeEqual(password, getAdminPassword());
}

export function createAdminSessionToken(username) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    username,
    iat: now,
    exp: now + getSessionTtlSeconds(),
  };

  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadBase64);
  if (!signature) {
    return "";
  }
  return `${payloadBase64}.${signature}`;
}

export function verifyAdminSessionToken(token) {
  const raw = String(token || "");
  if (!raw.includes(".")) {
    return null;
  }

  const [payloadBase64, signature] = raw.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadBase64);
  if (!expectedSignature || !safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    if (!payload?.exp || now >= payload.exp) {
      return null;
    }
    if (!payload?.username) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionFromRequest(request) {
  const cookieHeader = request.headers.get("cookie");
  const cookiesMap = parseCookieHeader(cookieHeader);
  return verifyAdminSessionToken(cookiesMap[ADMIN_SESSION_COOKIE] || "");
}

export async function getAdminSessionFromServerCookies() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(raw);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionTtlSeconds(),
  };
}

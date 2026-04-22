import crypto from "crypto";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";

export const ADMIN_SESSION_COOKIE = "glc_admin_session";
const DEFAULT_MEMBER_ADMIN_ROLE_KEYS = ["superuser", "pastor"];

function getSessionTtlSeconds() {
  const days = Number.parseInt(process.env.ADMIN_SESSION_TTL_DAYS || "7", 10);
  if (!Number.isFinite(days) || days < 1) {
    return 7 * 24 * 60 * 60;
  }
  return days * 24 * 60 * 60;
}

function getPasswordHashIterations() {
  const iterations = Number.parseInt(process.env.ADMIN_PASSWORD_ITERATIONS || "210000", 10);
  if (!Number.isFinite(iterations) || iterations < 100000) {
    return 210000;
  }
  return iterations;
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

export function isAdminLoginBypassEnabled() {
  const explicit = parseBooleanEnvFlag(process.env.ADMIN_BYPASS_LOGIN);
  if (explicit !== null) {
    return explicit;
  }

  return false;
}

function buildBypassAdminSession() {
  const now = Math.floor(Date.now() / 1000);
  const fallbackUsername = String(process.env.ADMIN_BYPASS_USERNAME || "").trim() || "admin";
  return {
    username: fallbackUsername,
    iat: now,
    exp: now + getSessionTtlSeconds(),
    memberId: null,
    isSuperuser: true,
    source: "dev_bypass",
  };
}

function hasSupabaseAdminRuntimeConfig() {
  const hasServiceRoleKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_PUBLIC_SERVICE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE,
  );

  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && hasServiceRoleKey);
}

function normalizeLoginUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .slice(0, 80);
}

function normalizeRoleKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getMemberAdminRoleAllowlist() {
  const fromEnv = String(process.env.ADMIN_MEMBER_UPGRADE_ROLE_KEYS || "")
    .split(",")
    .map((entry) => normalizeRoleKey(entry))
    .filter(Boolean);

  const effective = fromEnv.length ? fromEnv : DEFAULT_MEMBER_ADMIN_ROLE_KEYS;
  return new Set(effective.map((entry) => normalizeRoleKey(entry)).filter(Boolean));
}

function resolveSessionUsername(username, memberId, email) {
  const normalized = normalizeLoginUsername(username);
  if (normalized) {
    return normalized;
  }

  const emailLocalPart = normalizeLoginUsername(String(email || "").split("@")[0]);
  if (emailLocalPart) {
    return emailLocalPart;
  }

  const fallbackId = String(memberId || "").replace(/[^a-z0-9]+/gi, "").slice(0, 8).toLowerCase();
  return fallbackId ? `member-${fallbackId}` : "member";
}

async function getMemberRoleAssignments(supabase, memberId) {
  const normalizedMemberId = String(memberId || "").trim();
  if (!normalizedMemberId) {
    return [];
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("team_member_roles")
    .select("role_id, is_role_admin")
    .eq("member_id", normalizedMemberId);

  if (assignmentsError || !Array.isArray(assignments) || !assignments.length) {
    return [];
  }

  const roleIds = Array.from(
    new Set(assignments.map((entry) => String(entry?.role_id || "").trim()).filter(Boolean)),
  );

  if (!roleIds.length) {
    return assignments.map((entry) => ({
      roleKey: "",
      isRoleAdmin: Boolean(entry?.is_role_admin),
    }));
  }

  const { data: roles, error: rolesError } = await supabase.from("team_roles").select("id, role_key").in("id", roleIds);
  const roleKeyById = new Map();

  if (!rolesError && Array.isArray(roles)) {
    for (const role of roles) {
      const id = String(role?.id || "").trim();
      if (!id) {
        continue;
      }
      roleKeyById.set(id, normalizeRoleKey(role?.role_key));
    }
  }

  return assignments.map((entry) => ({
    roleKey: roleKeyById.get(String(entry?.role_id || "").trim()) || "",
    isRoleAdmin: Boolean(entry?.is_role_admin),
  }));
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

export function hashAdminPassword(password) {
  const plain = String(password || "");
  if (plain.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const iterations = getPasswordHashIterations();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 64, "sha512").toString("hex");
  return `pbkdf2_sha512$${iterations}$${salt}$${hash}`;
}

export function verifyHashedAdminPassword(password, storedHash) {
  const serialized = String(storedHash || "");
  const parts = serialized.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha512") {
    return false;
  }

  const iterations = Number.parseInt(parts[1], 10);
  const salt = parts[2];
  const expectedHash = parts[3];
  if (!Number.isFinite(iterations) || iterations < 1 || !salt || !expectedHash) {
    return false;
  }

  const derivedHash = crypto.pbkdf2Sync(String(password || ""), salt, iterations, 64, "sha512").toString("hex");
  return safeEqual(derivedHash, expectedHash);
}

export function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

export function isAdminAuthConfigured() {
  if (isAdminLoginBypassEnabled()) {
    return true;
  }

  if (!getSessionSecret()) {
    return false;
  }

  const hasEnvAdminCredentials = Boolean(getAdminUsername() && getAdminPassword());
  return hasEnvAdminCredentials || hasSupabaseAdminRuntimeConfig();
}

export function verifyAdminCredentials(username, password) {
  if (!getSessionSecret()) {
    return false;
  }
  if (!getAdminUsername() || !getAdminPassword()) {
    return false;
  }
  return safeEqual(username, getAdminUsername()) && safeEqual(password, getAdminPassword());
}

export async function verifyTeamMemberCredentials(username, password) {
  if (!getSessionSecret() || !hasSupabaseAdminRuntimeConfig()) {
    return null;
  }

  const normalizedUsername = normalizeLoginUsername(username);
  if (!normalizedUsername || !String(password || "")) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("team_members")
    .select("id, username, password_hash, is_superuser, is_active")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error || !data || !data.is_active || !data.password_hash) {
    return null;
  }

  if (!verifyHashedAdminPassword(password, data.password_hash)) {
    return null;
  }

  return {
    username: data.username,
    memberId: data.id,
    isSuperuser: Boolean(data.is_superuser),
    source: "team_member",
  };
}

export async function getAdminUpgradeSessionFromMemberCookies() {
  if (!getSessionSecret() || !hasSupabaseAdminRuntimeConfig()) {
    return null;
  }

  const currentMember = await getCurrentMemberFromServerCookies();
  if (!currentMember?.member?.id) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data: memberRecord, error: memberError } = await supabase
    .from("team_members")
    .select("id, username, email, is_superuser, is_active, password_hash")
    .eq("id", currentMember.member.id)
    .maybeSingle();

  if (memberError || !memberRecord || memberRecord.is_active === false) {
    return null;
  }

  const roleAssignments = await getMemberRoleAssignments(supabase, memberRecord.id);
  const roleKeys = Array.from(
    new Set(roleAssignments.map((entry) => normalizeRoleKey(entry.roleKey)).filter(Boolean)),
  );

  const hasRoleAdminAssignment = roleAssignments.some((entry) => entry.isRoleAdmin);
  const allowedRoleKeys = getMemberAdminRoleAllowlist();
  const hasAllowedRole = roleKeys.some((roleKey) => allowedRoleKeys.has(roleKey));
  const hasLegacyAdminPassword = Boolean(memberRecord.password_hash);
  const isSuperuser = Boolean(memberRecord.is_superuser || roleKeys.includes("superuser"));

  const canUpgrade = isSuperuser || hasRoleAdminAssignment || hasAllowedRole || hasLegacyAdminPassword;
  if (!canUpgrade) {
    return null;
  }

  const sessionUsername = resolveSessionUsername(
    memberRecord.username || currentMember.member.username,
    memberRecord.id,
    memberRecord.email || currentMember.member.email || currentMember.user?.email,
  );

  return {
    username: sessionUsername,
    memberId: memberRecord.id,
    isSuperuser,
    source: "member_session",
    roleKeys,
    hasRoleAdminAssignment,
  };
}

export function createAdminSessionToken(username, metadata = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    username,
    iat: now,
    exp: now + getSessionTtlSeconds(),
    memberId: metadata.memberId || null,
    isSuperuser: Boolean(metadata.isSuperuser),
    source: metadata.source || "env",
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
  const session = verifyAdminSessionToken(cookiesMap[ADMIN_SESSION_COOKIE] || "");
  if (session) {
    return session;
  }

  if (isAdminLoginBypassEnabled()) {
    return buildBypassAdminSession();
  }

  return null;
}

export async function getAdminSessionFromServerCookies() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const session = verifyAdminSessionToken(raw);
  if (session) {
    return session;
  }

  if (isAdminLoginBypassEnabled()) {
    return buildBypassAdminSession();
  }

  return null;
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

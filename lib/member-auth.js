import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MEMBER_SELECT = "id, username, full_name, email, phone, auth_user_id, is_active, is_superuser, notes, created_at, last_login_at";

function getSupabasePublicConfig() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    supabasePublishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      "",
  };
}

function normalizeOptionalText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function normalizeUrl(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  try { return encodeURI(normalized); } catch { return normalized; }
}

export function getMemberProfilePhotoUrl(userLike) {
  const metadata = userLike?.user_metadata || userLike?.userMetadata || {};
  const candidates = [
    metadata.profile_photo_url,
    metadata.profilePhotoUrl,
    metadata.photo_url,
    metadata.avatar_url,
    metadata.picture,
    userLike?.profile_photo_url,
    userLike?.profilePhotoUrl,
    userLike?.photo_url,
    userLike?.photoUrl,
  ];
  for (const candidate of candidates) {
    const url = normalizeUrl(candidate);
    if (url) return url;
  }
  return "";
}

function normalizeEmail(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized || null;
}

export function normalizeMemberUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .slice(0, 48);
}

function getUsernameBase({ fullName, email }) {
  const fromName = normalizeMemberUsername(String(fullName || "").replace(/\s+/g, "-"));
  if (fromName.length >= 3) return fromName;
  const fromEmail = normalizeMemberUsername(String(email || "").split("@")[0] || "");
  return fromEmail.length >= 3 ? fromEmail : "member";
}

async function usernameExists(supabase, username, excludeMemberId = null) {
  let query = supabase.from("team_members").select("id").eq("username", username).limit(1);
  if (excludeMemberId) query = query.neq("id", excludeMemberId);
  const { data, error } = await query.maybeSingle();
  return !error && Boolean(data?.id);
}

async function getAvailableUsername(supabase, profile, excludeMemberId = null) {
  const base = getUsernameBase(profile);
  if (!(await usernameExists(supabase, base, excludeMemberId))) return base;
  for (let index = 2; index <= 200; index += 1) {
    const candidate = `${base}-${index}`.slice(0, 48);
    if (!(await usernameExists(supabase, candidate, excludeMemberId))) return candidate;
  }
  return `${base}-${Date.now().toString().slice(-6)}`.slice(0, 48);
}

function toSessionShape(member, user) {
  return {
    memberId: member?.id || "",
    username: member?.username || "",
    fullName: member?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "",
    email: member?.email || user?.email || "",
    isSuperuser: Boolean(member?.is_superuser),
  };
}

async function getMemberByAuthUserId(supabase, authUserId) {
  if (!authUserId) return null;
  const { data, error } = await supabase.from("team_members").select(MEMBER_SELECT).eq("auth_user_id", authUserId).maybeSingle();
  return error ? null : data || null;
}

async function getMemberByEmail(supabase, email) {
  if (!email) return null;
  const { data, error } = await supabase.from("team_members").select(MEMBER_SELECT).eq("email", email).maybeSingle();
  return error ? null : data || null;
}

export function getMissingMemberAuthConfig() {
  const { supabaseUrl, supabasePublishableKey } = getSupabasePublicConfig();
  const missing = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabasePublishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return missing;
}

export function isMemberAuthConfigured() {
  return getMissingMemberAuthConfig().length === 0;
}

export function isLocalMemberAccessBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.LOCAL_MEMBER_ACCESS_BYPASS === "true";
}

async function readAndRefreshOwnMemberProfile(user, { fullName, phone, updateLastLoginAt }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  let member = await getMemberByAuthUserId(supabase, user.id);
  if (!member) return null;

  const email = normalizeEmail(user.email);
  const resolvedFullName =
    normalizeOptionalText(fullName) ||
    normalizeOptionalText(user.user_metadata?.full_name) ||
    normalizeOptionalText(user.user_metadata?.name);
  const resolvedPhone = normalizeOptionalText(phone) || normalizeOptionalText(user.user_metadata?.phone);

  const updates = {};
  if (email && member.email !== email) updates.email = email;
  if (resolvedFullName && member.full_name !== resolvedFullName) updates.full_name = resolvedFullName;
  if (resolvedPhone !== null && resolvedPhone !== member.phone) updates.phone = resolvedPhone;
  if (updateLastLoginAt) updates.last_login_at = new Date().toISOString();

  if (Object.keys(updates).length) {
    const { data, error } = await supabase
      .from("team_members")
      .update(updates)
      .eq("id", member.id)
      .select(MEMBER_SELECT)
      .single();
    if (!error && data) member = data;
  }

  return member;
}

async function repairLegacyMemberProfileWithAdmin(user, { fullName, phone, notes, updateLastLoginAt }) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const email = normalizeEmail(user.email);
  const resolvedFullName =
    normalizeOptionalText(fullName) ||
    normalizeOptionalText(user.user_metadata?.full_name) ||
    normalizeOptionalText(user.user_metadata?.name);
  const resolvedPhone = normalizeOptionalText(phone) || normalizeOptionalText(user.user_metadata?.phone);
  const nowIso = new Date().toISOString();

  let member = await getMemberByAuthUserId(supabase, user.id);
  if (!member && email) member = await getMemberByEmail(supabase, email);

  if (member) {
    const updates = {};
    if (member.auth_user_id !== user.id) updates.auth_user_id = user.id;
    if (email && member.email !== email) updates.email = email;
    if (resolvedFullName && member.full_name !== resolvedFullName) updates.full_name = resolvedFullName;
    if (resolvedPhone !== member.phone) updates.phone = resolvedPhone;
    if (!member.username) updates.username = await getAvailableUsername(supabase, { fullName: resolvedFullName, email }, member.id);
    if (member.is_active !== true) updates.is_active = true;
    if (!member.notes && notes) updates.notes = notes;
    if (updateLastLoginAt) updates.last_login_at = nowIso;

    if (Object.keys(updates).length) {
      const { data, error } = await supabase.from("team_members").update(updates).eq("id", member.id).select(MEMBER_SELECT).single();
      if (!error && data) member = data;
    }
    return member;
  }

  const username = await getAvailableUsername(supabase, { fullName: resolvedFullName, email });
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      username,
      auth_user_id: user.id,
      full_name: resolvedFullName,
      email,
      phone: resolvedPhone,
      is_superuser: false,
      is_active: true,
      account_state: "active",
      notes: notes || "Member account linked through Supabase Auth.",
      last_login_at: updateLastLoginAt ? nowIso : null,
    })
    .select(MEMBER_SELECT)
    .single();
  return error ? null : data;
}

export async function ensureMemberProfileForAuthUser({
  user,
  fullName = null,
  phone = null,
  notes = null,
  updateLastLoginAt = false,
}) {
  if (!isMemberAuthConfigured() || !user?.id) return null;

  const member = await readAndRefreshOwnMemberProfile(user, {
    fullName,
    phone,
    updateLastLoginAt,
  });
  if (member) return member;

  // Legacy recovery only. New Auth users are linked by the database trigger and do not require an admin secret.
  return repairLegacyMemberProfileWithAdmin(user, {
    fullName,
    phone,
    notes,
    updateLastLoginAt,
  });
}

export async function getCurrentMemberFromServerCookies() {
  if (!isMemberAuthConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const member = await ensureMemberProfileForAuthUser({ user });
  if (!member || member.is_active === false) return null;
  return { user, member, session: toSessionShape(member, user) };
}

export async function getMemberSessionFromServerCookies() {
  const current = await getCurrentMemberFromServerCookies();
  return current?.session || null;
}

export async function getMemberRecordById(memberId) {
  if (!isMemberAuthConfigured() || !memberId) return null;

  const memberClient = await createSupabaseServerClient();
  if (memberClient) {
    const { data, error } = await memberClient.from("team_members").select(MEMBER_SELECT).eq("id", memberId).maybeSingle();
    if (!error && data && data.is_active !== false) return data;
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return null;
  const { data, error } = await adminClient.from("team_members").select(MEMBER_SELECT).eq("id", memberId).maybeSingle();
  if (error || !data || data.is_active === false) return null;
  return data;
}

export async function requireMemberSession() {
  const currentMember = await getCurrentMemberFromServerCookies();
  if (!currentMember) {
    return {
      currentMember: null,
      session: null,
      member: null,
      user: null,
      error: NextResponse.json({ success: false, message: "Please sign in to continue." }, { status: 401 }),
    };
  }
  return {
    currentMember,
    session: currentMember.session,
    member: currentMember.member,
    user: currentMember.user,
    error: null,
  };
}

export async function verifyCurrentMemberPassword(email, password) {
  const { supabaseUrl, supabasePublishableKey } = getSupabasePublicConfig();
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");
  if (!supabaseUrl || !supabasePublishableKey || !normalizedEmail || !rawPassword) return false;

  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: rawPassword });
  if (data?.session) await supabase.auth.signOut();
  return !error && Boolean(data?.user?.id);
}

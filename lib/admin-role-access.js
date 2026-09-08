import { normalizeId } from "@/lib/admin-api";

const ROLE_KEY_ALIASES = {
  super_user: "superuser",
  music_minister: "worship_leader",
  worship_minister: "worship_leader",
  media: "media_team",
  media_lead: "media_team",
  foh: "foh_sound",
  foh_lead: "foh_sound",
  youth_assistant: "youth_minister_assistant",
  youth_ministry_assistant: "youth_minister_assistant",
  kids_ministry: "kids_church",
  kids_ministry_leader: "kids_church",
  childrens_church: "kids_church",
  assiciate_pastor: "associate_pastor",
};

const ORDER_REQUEST_SUBMITTER_KEYS = new Set([
  "worship_leader",
  "youth_minister",
  "youth_minister_assistant",
  "kids_church",
  "media_team",
  "foh_sound",
  "pastor",
  "superuser",
]);

const ORDER_REQUEST_REVIEWER_KEYS = new Set(["pastor", "associate_pastor", "superuser"]);
const BOOKKEEPING_KEYS = new Set(["pastor", "bookkeeper", "superuser"]);

export function normalizeRoleKeyForPolicy(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) return "";
  return ROLE_KEY_ALIASES[normalized] || normalized;
}

export function normalizeRoleKeysForPolicy(roleKeys) {
  return Array.from(new Set((Array.isArray(roleKeys) ? roleKeys : []).map((key) => normalizeRoleKeyForPolicy(key)).filter(Boolean)));
}

export async function getMemberRoles(supabase, memberId) {
  const normalizedMemberId = normalizeId(memberId);
  if (!normalizedMemberId) return [];

  const { data, error } = await supabase
    .from("team_member_roles")
    .select("role_id, is_role_admin")
    .eq("member_id", normalizedMemberId);

  if (error || !Array.isArray(data) || !data.length) return [];

  const roleIds = Array.from(new Set(data.map((entry) => normalizeId(entry.role_id)).filter(Boolean)));
  if (!roleIds.length) return [];

  const { data: roles, error: rolesError } = await supabase
    .from("team_roles")
    .select("id, role_key, name, description, is_system, is_active")
    .in("id", roleIds);

  if (rolesError || !Array.isArray(roles) || !roles.length) return [];

  const adminRoleIds = new Set(data.filter((entry) => Boolean(entry.is_role_admin)).map((entry) => normalizeId(entry.role_id)));

  return roles.map((role) => ({
    id: role.id,
    role_key: role.role_key,
    name: role.name,
    description: role.description || "",
    is_system: Boolean(role.is_system),
    is_active: role.is_active !== false,
    is_role_admin: adminRoleIds.has(role.id),
  }));
}

export async function getMemberRoleKeys(supabase, memberId) {
  const roles = await getMemberRoles(supabase, memberId);
  return roles
    .filter((role) => role.is_active !== false)
    .map((role) => String(role.role_key || "").trim().toLowerCase())
    .filter(Boolean);
}

export function hasAnyRole(roleKeys, requiredRoleKeys) {
  const normalizedCurrent = new Set(normalizeRoleKeysForPolicy(roleKeys));
  const required = normalizeRoleKeysForPolicy(requiredRoleKeys);
  if (!required.length) return true;
  return required.some((key) => normalizedCurrent.has(key));
}

export function hasRole(roleKeys, roleKey, { isSuperuser = false } = {}) {
  if (isSuperuser) return true;
  const normalizedTarget = normalizeRoleKeyForPolicy(roleKey);
  if (!normalizedTarget) return false;
  return hasAnyRole(roleKeys, [normalizedTarget]);
}

export function isOrderRequestSubmitterRole(roleKey) {
  return ORDER_REQUEST_SUBMITTER_KEYS.has(normalizeRoleKeyForPolicy(roleKey));
}

export function canSubmitOrderRequests(roleKeys, isSuperuser = false) {
  if (isSuperuser) return true;
  return hasAnyRole(roleKeys, Array.from(ORDER_REQUEST_SUBMITTER_KEYS));
}

export function canReviewOrderRequests(roleKeys, isSuperuser = false) {
  if (isSuperuser) return true;
  return hasAnyRole(roleKeys, Array.from(ORDER_REQUEST_REVIEWER_KEYS));
}

export function canViewAllOrderRequests(roleKeys, isSuperuser = false) {
  return canReviewOrderRequests(roleKeys, isSuperuser);
}

export function canViewYouthAssistantOrderRequests(roleKeys, isSuperuser = false) {
  if (isSuperuser) return true;
  return hasAnyRole(roleKeys, ["youth_minister"]);
}

export function canAccessBookkeeping(roleKeys, isSuperuser = false) {
  if (isSuperuser) return true;
  return hasAnyRole(roleKeys, Array.from(BOOKKEEPING_KEYS));
}

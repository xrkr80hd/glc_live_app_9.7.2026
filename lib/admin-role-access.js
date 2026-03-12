import { normalizeId } from "@/lib/admin-api";

export async function getMemberRoles(supabase, memberId) {
  const normalizedMemberId = normalizeId(memberId);
  if (!normalizedMemberId) {
    return [];
  }

  const { data, error } = await supabase
    .from("team_member_roles")
    .select("role_id, is_role_admin")
    .eq("member_id", normalizedMemberId);

  if (error || !Array.isArray(data) || !data.length) {
    return [];
  }

  const roleIds = Array.from(
    new Set(data.map((entry) => normalizeId(entry.role_id)).filter(Boolean)),
  );
  if (!roleIds.length) {
    return [];
  }

  const { data: roles, error: rolesError } = await supabase
    .from("team_roles")
    .select("id, role_key, name")
    .in("id", roleIds);

  if (rolesError || !Array.isArray(roles) || !roles.length) {
    return [];
  }

  const adminRoleIds = new Set(
    data.filter((entry) => Boolean(entry.is_role_admin)).map((entry) => normalizeId(entry.role_id)),
  );

  return roles.map((role) => ({
    id: role.id,
    role_key: role.role_key,
    name: role.name,
    is_role_admin: adminRoleIds.has(role.id),
  }));
}

export async function getMemberRoleKeys(supabase, memberId) {
  const roles = await getMemberRoles(supabase, memberId);
  return roles
    .map((role) => String(role.role_key || "").trim().toLowerCase())
    .filter(Boolean);
}

export function hasAnyRole(roleKeys, requiredRoleKeys) {
  const normalizedCurrent = new Set(
    (Array.isArray(roleKeys) ? roleKeys : [])
      .map((key) => String(key || "").trim().toLowerCase())
      .filter(Boolean),
  );

  const required = (Array.isArray(requiredRoleKeys) ? requiredRoleKeys : [])
    .map((key) => String(key || "").trim().toLowerCase())
    .filter(Boolean);

  if (!required.length) {
    return true;
  }

  return required.some((key) => normalizedCurrent.has(key));
}

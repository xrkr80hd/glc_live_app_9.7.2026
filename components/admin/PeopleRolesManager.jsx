"use client";

import { useEffect, useMemo, useState } from "react";

function memberName(member) {
  return member?.full_name || member?.username || member?.email || "Member";
}

function groupPermissions(permissions) {
  return permissions.reduce((groups, permission) => {
    const key = permission.module_key || "general";
    groups[key] ||= [];
    groups[key].push(permission);
    return groups;
  }, {});
}

export function PeopleRolesManager() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberRoleIds, setMemberRoleIds] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [rolePermissionIds, setRolePermissionIds] = useState([]);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function request(url, init) {
    const response = await fetch(url, { ...init, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || "Request failed.");
    return payload;
  }

  async function load() {
    try {
      const [memberPayload, rolePayload, permissionPayload] = await Promise.all([
        request("/api/admin/team-members?include_inactive=false&limit=500"),
        request("/api/admin/team-roles?include_inactive=false&limit=300"),
        request("/api/admin/permissions"),
      ]);
      setMembers(memberPayload.teamMembers || []);
      setRoles(rolePayload.teamRoles || []);
      setPermissions(permissionPayload.permissions || []);
      setSelectedMemberId((current) => current || memberPayload.teamMembers?.[0]?.id || "");
      setSelectedRoleId((current) => current || rolePayload.teamRoles?.find((role) => !role.is_system)?.id || rolePayload.teamRoles?.[0]?.id || "");
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load people and roles.");
    }
  }

  useEffect(() => { load(); }, []);

  const selectedMember = members.find((member) => member.id === selectedMemberId) || null;
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;

  useEffect(() => {
    setMemberRoleIds(selectedMember?.role_ids || []);
  }, [selectedMemberId, selectedMember?.role_ids]);

  useEffect(() => {
    if (!selectedRoleId) {
      setRolePermissionIds([]);
      return;
    }
    request(`/api/admin/team-roles/${selectedRoleId}/permissions`)
      .then((payload) => setRolePermissionIds(payload.permissionIds || []))
      .catch((loadError) => setError(loadError.message || "Unable to load role permissions."));
  }, [selectedRoleId]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => [member.full_name, member.username, member.email]
      .map((value) => String(value || "").toLowerCase()).join(" ").includes(query));
  }, [members, search]);

  const permissionGroups = useMemo(() => groupPermissions(permissions), [permissions]);

  function toggleMemberRole(roleId) {
    setMemberRoleIds((current) => current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId]);
  }

  function togglePermission(permissionId) {
    setRolePermissionIds((current) => current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId]);
  }

  async function saveMemberRoles() {
    if (!selectedMember) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = await request(`/api/admin/team-members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role_ids: memberRoleIds }),
      });
      setMembers((current) => current.map((member) => member.id === payload.teamMember.id ? payload.teamMember : member));
      setNotice(`Roles updated for ${memberName(payload.teamMember)}.`);
    } catch (saveError) {
      setError(saveError.message || "Unable to save roles.");
    } finally {
      setBusy(false);
    }
  }

  async function createRole(event) {
    event.preventDefault();
    if (!newRole.name.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = await request("/api/admin/team-roles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newRole.name, description: newRole.description, is_system: false, is_active: true }),
      });
      setRoles((current) => [...current, payload.teamRole].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedRoleId(payload.teamRole.id);
      setNewRole({ name: "", description: "" });
      setNotice(`${payload.teamRole.name} created. Its ministry chat is ready too.`);
    } catch (createError) {
      setError(createError.message || "Unable to create ministry role.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRolePermissions() {
    if (!selectedRole) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request(`/api/admin/team-roles/${selectedRole.id}/permissions`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ permission_ids: rolePermissionIds }),
      });
      setNotice(`Permissions saved for ${selectedRole.name}.`);
    } catch (saveError) {
      setError(saveError.message || "Unable to save permissions.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p> : null}

      <details open className="overflow-hidden rounded-2xl border border-[#d7e4dc] bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">People</p>
              <h2 className="mt-1 text-xl font-bold text-[#173329]">Assign Member Roles</h2>
              <p className="mt-1 text-sm text-[#6f8379]">A member keeps one account and can have as many ministry roles as needed.</p>
            </div>
            <span className="text-xl text-[#638176]" aria-hidden="true">⌄</span>
          </div>
        </summary>
        <div className="border-t border-[#e3ece7] p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <div>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members" className="h-11 w-full rounded-xl border border-[#cdded4] bg-white px-3 text-sm text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" />
              <div className="mt-2 max-h-[430px] overflow-y-auto rounded-xl border border-[#dce8e1]">
                {filteredMembers.map((member) => (
                  <button key={member.id} type="button" onClick={() => setSelectedMemberId(member.id)} className={`block w-full border-b border-[#edf2ef] px-3 py-3 text-left last:border-0 ${member.id === selectedMemberId ? "bg-[#e9f4ed]" : "hover:bg-[#f6faf7]"}`}>
                    <strong className="block text-sm text-[#173329]">{memberName(member)}</strong>
                    <span className="block truncate text-xs text-[#71847b]">{member.email || member.username}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dce8e1] bg-[#f8fbf9] p-4">
              <h3 className="text-lg font-bold text-[#173329]">{memberName(selectedMember)}</h3>
              <p className="text-sm text-[#71847b]">Check every role this person should have.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => (
                  <label key={role.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${memberRoleIds.includes(role.id) ? "border-[#75a98b] bg-[#e8f3ec]" : "border-[#d7e4dc] bg-white"}`}>
                    <input type="checkbox" checked={memberRoleIds.includes(role.id)} onChange={() => toggleMemberRole(role.id)} className="mt-0.5 h-5 w-5 accent-[#1f6846]" />
                    <span>
                      <strong className="block text-sm text-[#173329]">{role.name}</strong>
                      {role.description ? <span className="mt-0.5 block text-xs leading-4 text-[#71847b]">{role.description}</span> : null}
                    </span>
                  </label>
                ))}
              </div>
              <button type="button" onClick={saveMemberRoles} disabled={!selectedMember || busy} className="mt-4 h-11 rounded-xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8]">Save Roles</button>
            </div>
          </div>
        </div>
      </details>

      <details className="overflow-hidden rounded-2xl border border-[#d7e4dc] bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">Ministries</p>
              <h2 className="mt-1 text-xl font-bold text-[#173329]">Create a Custom Ministry</h2>
              <p className="mt-1 text-sm text-[#6f8379]">Add Tract Ministry, Greeters, Outreach, Nursery, or anything Liberty needs later.</p>
            </div>
            <span className="text-xl text-[#638176]" aria-hidden="true">⌄</span>
          </div>
        </summary>
        <div className="border-t border-[#e3ece7] p-4 sm:p-5">
          <form onSubmit={createRole} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Ministry Name<input value={newRole.name} onChange={(event) => setNewRole((current) => ({ ...current, name: event.target.value }))} placeholder="Tract Ministry" className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" /></label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Description<input value={newRole.description} onChange={(event) => setNewRole((current) => ({ ...current, description: event.target.value }))} placeholder="Passes out and stocks church tracts" className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" /></label>
            <button disabled={busy || !newRole.name.trim()} className="h-11 rounded-xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8] sm:col-span-2">Create Ministry</button>
          </form>
        </div>
      </details>

      <details className="overflow-hidden rounded-2xl border border-[#d7e4dc] bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">Access</p>
              <h2 className="mt-1 text-xl font-bold text-[#173329]">Role Permissions</h2>
              <p className="mt-1 text-sm text-[#6f8379]">Choose exactly what a ministry is allowed to see and manage.</p>
            </div>
            <span className="text-xl text-[#638176]" aria-hidden="true">⌄</span>
          </div>
        </summary>
        <div className="border-t border-[#e3ece7] p-4 sm:p-5">
          <label className="grid max-w-md gap-1.5 text-sm font-semibold text-[#355b49]">Role<select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {Object.entries(permissionGroups).map(([moduleKey, modulePermissions]) => (
              <section key={moduleKey} className="rounded-2xl border border-[#dce8e1] bg-[#f8fbf9] p-3">
                <h3 className="mb-2 text-sm font-bold capitalize text-[#173329]">{moduleKey.replaceAll("_", " ")}</h3>
                <div className="grid gap-2">
                  {modulePermissions.map((permission) => (
                    <label key={permission.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dce8e1] bg-white p-3">
                      <input type="checkbox" checked={rolePermissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="mt-0.5 h-5 w-5 accent-[#1f6846]" />
                      <span><strong className="block text-sm text-[#173329]">{permission.name}</strong>{permission.description ? <span className="block text-xs leading-4 text-[#71847b]">{permission.description}</span> : null}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <button type="button" onClick={saveRolePermissions} disabled={!selectedRole || busy} className="mt-4 h-11 rounded-xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8]">Save Permissions</button>
        </div>
      </details>
    </div>
  );
}

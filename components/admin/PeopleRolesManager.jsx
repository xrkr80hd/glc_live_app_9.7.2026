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
  const [roleAdminIds, setRoleAdminIds] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [rolePermissionIds, setRolePermissionIds] = useState([]);
  const [roleDraft, setRoleDraft] = useState({ name: "", description: "", is_active: true });
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
        request("/api/admin/team-roles?include_inactive=true&limit=300"),
        request("/api/admin/permissions"),
      ]);
      const nextMembers = memberPayload.teamMembers || [];
      const nextRoles = rolePayload.teamRoles || [];
      setMembers(nextMembers);
      setRoles(nextRoles);
      setPermissions(permissionPayload.permissions || []);
      setSelectedMemberId((current) => current || nextMembers[0]?.id || "");
      setSelectedRoleId((current) => current || nextRoles.find((role) => !role.is_system)?.id || nextRoles[0]?.id || "");
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load people and roles.");
    }
  }

  useEffect(() => { load(); }, []);

  const selectedMember = members.find((member) => member.id === selectedMemberId) || null;
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;
  const activeRoles = roles.filter((role) => role.is_active !== false);
  const customRoles = roles.filter((role) => !role.is_system);

  useEffect(() => {
    setMemberRoleIds(selectedMember?.role_ids || []);
    setRoleAdminIds((selectedMember?.roles || []).filter((role) => role.is_role_admin).map((role) => role.id));
  }, [selectedMemberId, selectedMember]);

  useEffect(() => {
    if (!selectedRoleId) {
      setRolePermissionIds([]);
      return;
    }
    request(`/api/admin/team-roles/${selectedRoleId}/permissions`)
      .then((payload) => setRolePermissionIds(payload.permissionIds || []))
      .catch((loadError) => setError(loadError.message || "Unable to load role permissions."));
  }, [selectedRoleId]);

  useEffect(() => {
    setRoleDraft({
      name: selectedRole?.name || "",
      description: selectedRole?.description || "",
      is_active: selectedRole?.is_active !== false,
    });
  }, [selectedRoleId, selectedRole]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => [member.full_name, member.username, member.email]
      .map((value) => String(value || "").toLowerCase()).join(" ").includes(query));
  }, [members, search]);

  const permissionGroups = useMemo(() => groupPermissions(permissions), [permissions]);

  function toggleMemberRole(roleId) {
    setMemberRoleIds((current) => {
      if (current.includes(roleId)) {
        setRoleAdminIds((leaders) => leaders.filter((id) => id !== roleId));
        return current.filter((id) => id !== roleId);
      }
      return [...current, roleId];
    });
  }

  function toggleRoleLeader(roleId) {
    if (!memberRoleIds.includes(roleId)) return;
    setRoleAdminIds((current) => current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId]);
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
      const validLeaderIds = roleAdminIds.filter((id) => memberRoleIds.includes(id));
      await request(`/api/admin/team-members/${selectedMember.id}/role-admins`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role_admin_ids: validLeaderIds }),
      });
      const updatedMember = {
        ...payload.teamMember,
        roles: (payload.teamMember.roles || []).map((role) => ({ ...role, is_role_admin: validLeaderIds.includes(role.id) })),
      };
      setMembers((current) => current.map((member) => member.id === updatedMember.id ? updatedMember : member));
      setRoleAdminIds(validLeaderIds);
      setNotice(`Roles and ministry leadership updated for ${memberName(updatedMember)}.`);
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
      setNotice(`${payload.teamRole.name} created. Its ministry chat was created automatically.`);
    } catch (createError) {
      setError(createError.message || "Unable to create ministry role.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRoleSettings() {
    if (!selectedRole || selectedRole.is_system) return;
    if (!roleDraft.name.trim()) {
      setError("Ministry name cannot be empty.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = await request(`/api/admin/team-roles/${selectedRole.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: roleDraft.name,
          description: roleDraft.description,
          is_active: roleDraft.is_active,
        }),
      });
      setRoles((current) => current.map((role) => role.id === payload.teamRole.id ? payload.teamRole : role));
      setNotice(`${payload.teamRole.name} updated.`);
    } catch (saveError) {
      setError(saveError.message || "Unable to update ministry.");
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
              <p className="mt-1 text-sm text-[#6f8379]">One login can have several ministries. Mark a role as Leader when that person leads the ministry.</p>
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
              <p className="text-sm text-[#71847b]">Choose every role this person has. A ministry leader can also enter Leadership Chat.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {activeRoles.map((role) => {
                  const assigned = memberRoleIds.includes(role.id);
                  const leader = roleAdminIds.includes(role.id);
                  return (
                    <div key={role.id} className={`rounded-xl border p-3 ${assigned ? "border-[#75a98b] bg-[#e8f3ec]" : "border-[#d7e4dc] bg-white"}`}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input type="checkbox" checked={assigned} onChange={() => toggleMemberRole(role.id)} className="mt-0.5 h-5 w-5 accent-[#1f6846]" />
                        <span className="min-w-0">
                          <strong className="block text-sm text-[#173329]">{role.name}</strong>
                          {role.description ? <span className="mt-0.5 block text-xs leading-4 text-[#71847b]">{role.description}</span> : null}
                        </span>
                      </label>
                      {assigned && role.role_key !== "church_member" ? (
                        <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-[#cfe0d6] pt-2 text-xs font-semibold text-[#355b49]">
                          <input type="checkbox" checked={leader} onChange={() => toggleRoleLeader(role.id)} className="h-4 w-4 accent-[#1f6846]" />
                          Ministry leader
                        </label>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={saveMemberRoles} disabled={!selectedMember || busy} className="mt-4 h-11 rounded-xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8]">Save Access</button>
            </div>
          </div>
        </div>
      </details>

      <details className="overflow-hidden rounded-2xl border border-[#d7e4dc] bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">Ministries</p>
              <h2 className="mt-1 text-xl font-bold text-[#173329]">Custom Ministries</h2>
              <p className="mt-1 text-sm text-[#6f8379]">Create, rename, describe, activate, or pause a custom ministry without changing code.</p>
            </div>
            <span className="text-xl text-[#638176]" aria-hidden="true">⌄</span>
          </div>
        </summary>
        <div className="grid gap-5 border-t border-[#e3ece7] p-4 sm:p-5 lg:grid-cols-2">
          <form onSubmit={createRole} className="grid content-start gap-3 rounded-2xl border border-[#dce8e1] bg-[#f8fbf9] p-4">
            <h3 className="font-bold text-[#173329]">Create Ministry</h3>
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Ministry Name<input value={newRole.name} onChange={(event) => setNewRole((current) => ({ ...current, name: event.target.value }))} placeholder="Tract Ministry" className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" /></label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Description<textarea value={newRole.description} onChange={(event) => setNewRole((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="What does this ministry do?" className="rounded-xl border border-[#cdded4] bg-white px-3 py-2 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" /></label>
            <button disabled={busy || !newRole.name.trim()} className="h-11 rounded-xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8]">Create Ministry</button>
          </form>

          <div className="grid content-start gap-3 rounded-2xl border border-[#dce8e1] bg-[#f8fbf9] p-4">
            <h3 className="font-bold text-[#173329]">Edit Custom Ministry</h3>
            {customRoles.length ? (
              <>
                <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Ministry<select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]">{customRoles.map((role) => <option key={role.id} value={role.id}>{role.name}{role.is_active === false ? " (Paused)" : ""}</option>)}</select></label>
                {selectedRole && !selectedRole.is_system ? (
                  <>
                    <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Name<input value={roleDraft.name} onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]" /></label>
                    <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">Description<textarea value={roleDraft.description} onChange={(event) => setRoleDraft((current) => ({ ...current, description: event.target.value }))} rows={3} className="rounded-xl border border-[#cdded4] bg-white px-3 py-2 text-[#173329] outline-none focus:border-[#3d8b64]" /></label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#355b49]"><input type="checkbox" checked={roleDraft.is_active} onChange={(event) => setRoleDraft((current) => ({ ...current, is_active: event.target.checked }))} className="h-5 w-5 accent-[#1f6846]" /> Ministry active</label>
                    <button type="button" onClick={saveRoleSettings} disabled={busy} className="h-11 rounded-xl border border-[#92b7a2] bg-white px-5 text-sm font-bold text-[#1f6846] hover:bg-[#edf6f1]">Save Ministry</button>
                  </>
                ) : null}
              </>
            ) : <p className="text-sm text-[#71847b]">No custom ministries yet.</p>}
          </div>
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
          <label className="grid max-w-md gap-1.5 text-sm font-semibold text-[#355b49]">Role<select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}{role.is_active === false ? " (Paused)" : ""}</option>)}</select></label>
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function normalizeRoleIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean)));
}

function memberLabel(member) {
  if (!member) {
    return "Unknown member";
  }
  const name = String(member.full_name || "").trim();
  const username = String(member.username || "").trim();
  if (name && username) {
    return `${name} (${username})`;
  }
  return name || username || String(member.email || "").trim() || "Unknown member";
}

export function RoleAccessManager() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const [membersResponse, rolesResponse] = await Promise.all([
          fetch("/api/admin/team-members?include_inactive=false&limit=500", { cache: "no-store" }),
          fetch("/api/admin/team-roles?include_inactive=false&limit=200", { cache: "no-store" }),
        ]);

        const membersPayload = await membersResponse.json().catch(() => ({}));
        const rolesPayload = await rolesResponse.json().catch(() => ({}));

        if (!membersResponse.ok) {
          throw new Error(membersPayload?.error || "Unable to load members.");
        }
        if (!rolesResponse.ok) {
          throw new Error(rolesPayload?.error || "Unable to load roles.");
        }

        const nextMembers = Array.isArray(membersPayload?.teamMembers) ? membersPayload.teamMembers : [];
        const nextRoles = Array.isArray(rolesPayload?.teamRoles) ? rolesPayload.teamRoles : [];

        if (!isActive) {
          return;
        }

        setMembers(nextMembers);
        setRoles(nextRoles);

        if (!selectedMemberId && nextMembers.length) {
          const first = nextMembers[0];
          setSelectedMemberId(first.id);
          setSelectedRoleIds(normalizeRoleIds(first.role_ids));
        }
      } catch (requestError) {
        if (!isActive) {
          return;
        }
        setError(requestError.message || "Unable to load role access data.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isActive = false;
    };
  }, [selectedMemberId]);

  const filteredMembers = useMemo(() => {
    const query = String(search || "").trim().toLowerCase();
    if (!query) {
      return members;
    }
    return members.filter((member) => {
      const haystack = [
        member.full_name,
        member.username,
        member.email,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      return haystack.includes(query);
    });
  }, [members, search]);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) || null,
    [members, selectedMemberId],
  );

  const assignedRoleIds = useMemo(
    () => normalizeRoleIds(selectedMember?.role_ids),
    [selectedMember],
  );

  const selectedRoleSet = useMemo(() => new Set(selectedRoleIds), [selectedRoleIds]);
  const hasChanges = useMemo(() => {
    if (!selectedMember) {
      return false;
    }
    if (assignedRoleIds.length !== selectedRoleIds.length) {
      return true;
    }
    return assignedRoleIds.some((roleId) => !selectedRoleSet.has(roleId));
  }, [assignedRoleIds, selectedMember, selectedRoleIds, selectedRoleSet]);

  function handleSelectMember(memberId) {
    setSelectedMemberId(memberId);
    const member = members.find((item) => item.id === memberId);
    setSelectedRoleIds(normalizeRoleIds(member?.role_ids));
    setNotice("");
    setError("");
  }

  function handleToggleRole(roleId) {
    setSelectedRoleIds((current) => {
      const set = new Set(current);
      if (set.has(roleId)) {
        set.delete(roleId);
      } else {
        set.add(roleId);
      }
      return Array.from(set);
    });
    setNotice("");
  }

  async function handleSave() {
    if (!selectedMember) {
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/team-members/${selectedMember.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role_ids: selectedRoleIds,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save role assignments.");
      }

      const updatedMember = payload?.teamMember || null;
      if (updatedMember?.id) {
        setMembers((current) =>
          current.map((member) => (member.id === updatedMember.id ? updatedMember : member)),
        );
        setSelectedRoleIds(normalizeRoleIds(updatedMember.role_ids));
      }

      setNotice(`Saved roles for ${memberLabel(updatedMember || selectedMember)}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to save role assignments.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#27313b] py-0">
        <CardHeader className="px-5 pb-3 pt-5">
          <CardTitle className="text-xl text-white">Existing Member Role Manager</CardTitle>
          <CardDescription className="text-sm text-[#aab6c2]">
            Select a member, check the roles they should have, and save. Member login stays the same, only permissions expand.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <section className="space-y-3">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#9ca8b4]">
                Find Member
                <input
                  className="h-10 rounded-none border border-[#445262] bg-[#1b2430] px-3 text-sm text-white outline-none focus:border-[#2E7D32]"
                  placeholder="Search name, username, or email"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <div className="max-h-[420px] overflow-y-auto rounded-none border border-[#445262] bg-[#1b2430]">
                {isLoading ? (
                  <p className="px-3 py-3 text-sm text-[#aab6c2]">Loading members...</p>
                ) : filteredMembers.length ? (
                  <ul className="divide-y divide-[#3a4655]">
                    {filteredMembers.map((member) => {
                      const isSelected = member.id === selectedMemberId;
                      return (
                        <li key={member.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectMember(member.id)}
                            className={`grid w-full gap-1 px-3 py-3 text-left transition-colors ${
                              isSelected ? "bg-[#2E7D32]/24 text-white" : "text-[#d7dee5] hover:bg-[#2E7D32]/14"
                            }`}
                          >
                            <strong className="truncate text-sm">{memberLabel(member)}</strong>
                            <span className="truncate text-xs text-[#9fb0c2]">{member.email || "No email on file"}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-3 py-3 text-sm text-[#aab6c2]">No members match your search.</p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="rounded-none border border-[#445262] bg-[#1b2430] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9ca8b4]">Selected Member</p>
                <p className="mt-1 text-sm font-semibold text-white">{memberLabel(selectedMember)}</p>
                <p className="text-xs text-[#aab6c2]">{selectedMember?.email || "No email on file"}</p>
              </div>

              <div className="grid gap-2 rounded-none border border-[#445262] bg-[#1b2430] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9ca8b4]">Assign Roles</p>
                <div className="max-h-[420px] overflow-y-auto rounded-none border border-[#3b4757] bg-[#1f2935] p-2">
                  {roles.length ? (
                    <ul className="grid gap-2">
                      {roles.map((role) => {
                        const checked = selectedRoleSet.has(role.id);
                        return (
                          <li key={role.id}>
                            <label className="flex items-start gap-2 rounded-none border border-[#3b4757] bg-[#222d39] px-3 py-2 text-sm text-[#d7dee5]">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleRole(role.id)}
                                className="mt-[2px] h-4 w-4 rounded-none border-[#526177] bg-transparent accent-[#2E7D32]"
                                disabled={!selectedMember || isSaving}
                              />
                              <span className="grid gap-0.5">
                                <strong className="text-sm text-white">{role.name}</strong>
                                <span className="text-xs text-[#9fb0c2]">{role.role_key}</span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#aab6c2]">No roles found.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedMember || !hasChanges || isSaving}
                  className="h-10 rounded-none bg-[#2E7D32] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#276b2b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Role Access"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleIds(assignedRoleIds)}
                  disabled={!selectedMember || isSaving}
                  className="h-10 rounded-none border border-[#4a596a] bg-[#27313b] px-4 text-sm font-semibold text-[#d7dee5] transition-colors hover:bg-[#313f4d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>
              </div>

              {error ? <p className="text-sm text-[#ff8f8f]">{error}</p> : null}
              {notice ? <p className="text-sm text-[#9de6b0]">{notice}</p> : null}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

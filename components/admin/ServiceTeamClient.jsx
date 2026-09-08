"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function memberLabel(member) {
  return member?.full_name || member?.username || member?.email || "Member";
}

export function ServiceTeamClient() {
  const [data, setData] = useState({ services: [], members: [], roles: [], instruments: [], assignments: [], selectedServiceId: "" });
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({ memberId: "", roleKey: "worship_team", assignmentLabel: "", instrumentLabel: "", notes: "" });

  const load = useCallback(async (serviceId = "") => {
    setError("");
    try {
      const query = serviceId ? `?service_id=${encodeURIComponent(serviceId)}` : "";
      const response = await fetch(`/api/admin/service-team${query}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Unable to load service team.");
      setData(payload);
      setSelectedServiceId(payload.selectedServiceId || "");
    } catch (caught) {
      setError(caught?.message || "Unable to load service team.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function action(name, payload = {}) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/service-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to save service team.");
      setNotice("Saved.");
      await load(selectedServiceId);
      return true;
    } catch (caught) {
      setError(caught?.message || "Unable to save service team.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const membersById = useMemo(() => new Map((data.members || []).map((member) => [member.id, member])), [data.members]);
  const rolesByKey = useMemo(() => new Map((data.roles || []).map((role) => [role.role_key, role])), [data.roles]);
  const selectedMemberInstruments = useMemo(() => (data.instruments || []).filter((item) => item.member_id === draft.memberId), [data.instruments, draft.memberId]);
  const selectedService = (data.services || []).find((service) => service.id === selectedServiceId) || null;

  async function submit(event) {
    event.preventDefault();
    if (!selectedServiceId) return;
    const ok = await action("assign_member", { serviceId: selectedServiceId, ...draft });
    if (ok) setDraft({ memberId: "", roleKey: "worship_team", assignmentLabel: "", instrumentLabel: "", notes: "" });
  }

  return (
    <div className="min-h-screen bg-[#232b34] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">Master Admin</p>
            <h1 className="mt-1 text-3xl font-semibold">Service Team</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">Assign Worship, Media, FOH and other ministry roles to a specific service, including instrument or station responsibility.</p>
          </div>
          <div className="flex flex-wrap gap-2"><a href="/admin/service-planning" className="inline-flex h-10 items-center border border-[#8ee0c2]/40 px-4 text-sm font-semibold text-[#bff4df]">Service Planner</a><a href="/admin" className="inline-flex h-10 items-center border border-white/20 px-4 text-sm font-semibold">Admin Home</a></div>
        </header>

        {error ? <p className="border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</p> : null}
        {notice ? <p className="border border-emerald-400/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">{notice}</p> : null}

        <section className="border border-white/10 bg-[#303944] p-5">
          <label className="grid gap-1 text-sm"><span className="text-white/70">Service</span><select className="h-11 border border-white/15 bg-[#232b34] px-3 text-white" value={selectedServiceId} onChange={(e) => load(e.target.value)}><option value="">Select a service</option>{(data.services || []).map((service) => <option key={service.id} value={service.id}>{service.title} — {formatDateTime(service.starts_at)} ({service.status})</option>)}</select></label>
        </section>

        {selectedService ? (
          <>
            <form onSubmit={submit} className="grid gap-3 border border-white/10 bg-[#303944] p-5 md:grid-cols-2">
              <div className="md:col-span-2"><h2 className="text-xl font-semibold">Assign Someone</h2><p className="mt-1 text-sm text-white/55">{selectedService.title} · {formatDateTime(selectedService.starts_at)}</p></div>
              <label className="grid gap-1 text-sm"><span className="text-white/70">Member</span><select className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={draft.memberId} onChange={(e) => setDraft((v) => ({ ...v, memberId: e.target.value, instrumentLabel: "" }))} required><option value="">Choose member</option>{(data.members || []).map((member) => <option key={member.id} value={member.id}>{memberLabel(member)}</option>)}</select></label>
              <label className="grid gap-1 text-sm"><span className="text-white/70">Service Role</span><select className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={draft.roleKey} onChange={(e) => setDraft((v) => ({ ...v, roleKey: e.target.value }))} required>{(data.roles || []).map((role) => <option key={role.role_key} value={role.role_key}>{role.name || role.role_key}</option>)}</select></label>
              <label className="grid gap-1 text-sm"><span className="text-white/70">Assignment / Station</span><input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" placeholder="Lead vocal, Projector Slides, Stream Mix…" value={draft.assignmentLabel} onChange={(e) => setDraft((v) => ({ ...v, assignmentLabel: e.target.value }))} /></label>
              <label className="grid gap-1 text-sm"><span className="text-white/70">Instrument</span><input list="member-instruments" className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" placeholder="Vocals, acoustic guitar, drums…" value={draft.instrumentLabel} onChange={(e) => setDraft((v) => ({ ...v, instrumentLabel: e.target.value }))} /><datalist id="member-instruments">{selectedMemberInstruments.map((item) => <option key={item.id} value={item.label || item.instrument_key} />)}</datalist></label>
              <label className="grid gap-1 text-sm md:col-span-2"><span className="text-white/70">Notes</span><input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" placeholder="Service-specific notes" value={draft.notes} onChange={(e) => setDraft((v) => ({ ...v, notes: e.target.value }))} /></label>
              <button disabled={busy} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50 md:col-span-2">Assign to Service</button>
            </form>

            <section className="border border-white/10 bg-[#303944] p-5">
              <h2 className="text-xl font-semibold">Assigned Team</h2>
              <div className="mt-4 grid gap-2">
                {(data.assignments || []).map((assignment) => {
                  const member = membersById.get(assignment.member_id);
                  const role = rolesByKey.get(assignment.role_key);
                  return (
                    <article key={assignment.id} className="grid gap-3 border border-white/8 bg-[#232b34] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div><h3 className="font-semibold">{memberLabel(member)}</h3><p className="mt-1 text-sm text-[#bff4df]">{role?.name || assignment.role_key}{assignment.assignment_label ? ` · ${assignment.assignment_label}` : ""}{assignment.instrument_label ? ` · ${assignment.instrument_label}` : ""}</p>{assignment.notes ? <p className="mt-1 text-sm text-white/55">{assignment.notes}</p> : null}</div>
                      <button type="button" disabled={busy} onClick={() => action("remove_assignment", { assignmentId: assignment.id })} className="h-9 border border-red-400/35 px-3 text-sm font-semibold text-red-200 disabled:opacity-50">Remove</button>
                    </article>
                  );
                })}
                {!(data.assignments || []).length ? <p className="text-sm text-white/55">No team assignments have been added yet.</p> : null}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

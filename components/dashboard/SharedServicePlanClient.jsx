"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function memberLabel(member) {
  return member?.full_name || member?.username || "Member";
}

function localDateTimeInput(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function nextSundayTen() {
  const date = new Date();
  let add = (7 - date.getDay()) % 7;
  if (add === 0 && date.getHours() >= 10) add = 7;
  date.setDate(date.getDate() + add);
  date.setHours(10, 0, 0, 0);
  return localDateTimeInput(date);
}

export function SharedServicePlanClient({ roleLabel = "Ministry Team" }) {
  const [data, setData] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newService, setNewService] = useState({ title: "Sunday Service", startsAt: nextSundayTen(), serviceNotes: "" });
  const [newSong, setNewSong] = useState({ title: "", artist: "", keyOverride: "", leadMemberId: "", arrangementNotes: "" });

  const load = useCallback(async (serviceId = "") => {
    setError("");
    try {
      const query = serviceId ? `?service_id=${encodeURIComponent(serviceId)}` : "";
      const response = await fetch(`/api/service-planning${query}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Unable to load service plan.");
      setData(payload);
      setSelectedServiceId(payload?.selectedService?.id || "");
    } catch (caught) {
      setError(caught?.message || "Unable to load service plan.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function action(name, payload = {}, reloadId = selectedServiceId) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/service-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to save service plan.");
      const serviceId = result?.serviceId || reloadId || "";
      setNotice("Saved.");
      await load(serviceId);
      return true;
    } catch (caught) {
      setError(caught?.message || "Unable to save service plan.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const members = data?.members || [];
  const memberById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const stationById = useMemo(() => new Map((data?.stations || []).map((station) => [station.id, station])), [data?.stations]);
  const itemsByRun = useMemo(() => {
    const map = new Map();
    for (const item of data?.checklistItems || []) {
      if (!map.has(item.run_id)) map.set(item.run_id, []);
      map.get(item.run_id).push(item);
    }
    return map;
  }, [data?.checklistItems]);

  const canEdit = Boolean(data?.access?.canEditPlan);
  const canChecklist = Boolean(data?.access?.canManageChecklist);
  const selected = data?.selectedService || null;

  async function submitService(event) {
    event.preventDefault();
    const ok = await action("create_service", newService, "");
    if (ok) setNewService({ title: "Sunday Service", startsAt: nextSundayTen(), serviceNotes: "" });
  }

  async function submitSong(event) {
    event.preventDefault();
    if (!selectedServiceId) return;
    const ok = await action("add_song", { serviceId: selectedServiceId, ...newSong });
    if (ok) setNewSong({ title: "", artist: "", keyOverride: "", leadMemberId: "", arrangementNotes: "" });
  }

  return (
    <div className="min-h-screen bg-[#232b34] text-white">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">{roleLabel}</p>
            <h1 className="mt-1 text-3xl font-semibold">Shared Service Plan</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">One source of truth for the worship set, lead vocalist, cues, Media readiness and FOH visibility.</p>
          </div>
          <a href="/dashboard" className="inline-flex h-10 items-center justify-center border border-white/20 px-4 text-sm font-semibold hover:bg-white/8">My Dashboards</a>
        </header>

        {error ? <p className="border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</p> : null}
        {notice ? <p className="border border-emerald-400/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">{notice}</p> : null}

        <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <section className="border border-white/10 bg-[#303944] p-4">
              <h2 className="font-semibold">Services</h2>
              <div className="mt-3 grid gap-2">
                {(data?.services || []).map((service) => (
                  <button key={service.id} type="button" onClick={() => load(service.id)} className={`border px-3 py-3 text-left ${selectedServiceId === service.id ? "border-[#8ee0c2] bg-[#0f6048]/35" : "border-white/10 bg-white/4"}`}>
                    <strong className="block text-sm">{service.title}</strong>
                    <span className="mt-1 block text-xs text-white/60">{formatDateTime(service.starts_at)}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.08em] text-[#8ee0c2]">{service.status}</span>
                  </button>
                ))}
                {!(data?.services || []).length ? <p className="text-sm text-white/55">No published services are available yet.</p> : null}
              </div>
            </section>

            {canEdit ? (
              <form onSubmit={submitService} className="border border-white/10 bg-[#303944] p-4">
                <h2 className="font-semibold">New Service</h2>
                <div className="mt-3 grid gap-3">
                  <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-sm text-white" value={newService.title} onChange={(e) => setNewService((v) => ({ ...v, title: e.target.value }))} required />
                  <input type="datetime-local" className="h-10 border border-white/15 bg-[#232b34] px-3 text-sm text-white" value={newService.startsAt} onChange={(e) => setNewService((v) => ({ ...v, startsAt: e.target.value }))} required />
                  <textarea className="min-h-20 border border-white/15 bg-[#232b34] px-3 py-2 text-sm text-white" placeholder="Service notes" value={newService.serviceNotes} onChange={(e) => setNewService((v) => ({ ...v, serviceNotes: e.target.value }))} />
                  <button disabled={busy} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50">Create Service</button>
                </div>
              </form>
            ) : null}
          </aside>

          <main className="space-y-5">
            {!selected ? (
              <section className="border border-white/10 bg-[#303944] p-6 text-white/65">Select a service to open the shared plan.</section>
            ) : (
              <>
                <section className="border border-white/10 bg-[#303944] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">{selected.status}</p>
                      <h2 className="mt-1 text-2xl font-semibold">{selected.title}</h2>
                      <p className="mt-1 text-sm text-white/60">{formatDateTime(selected.starts_at)}</p>
                      {selected.service_notes ? <p className="mt-3 text-sm leading-6 text-white/75">{selected.service_notes}</p> : null}
                    </div>
                    {canEdit ? (
                      <div className="flex gap-2">
                        <button disabled={busy} onClick={() => action("set_service_status", { serviceId: selected.id, status: selected.status === "published" ? "draft" : "published" })} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50">
                          {selected.status === "published" ? "Return to Draft" : "Publish Plan"}
                        </button>
                        <button disabled={busy} onClick={() => action("initialize_checklists", { serviceId: selected.id })} className="h-10 border border-[#8ee0c2]/50 px-3 text-sm font-semibold text-[#bff4df] disabled:opacity-50">Prepare Checklists</button>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="border border-white/10 bg-[#303944] p-5">
                  <h2 className="text-xl font-semibold">Worship Set</h2>
                  <p className="mt-1 text-sm text-white/55">FOH and Media see the same lead vocalist assignment shown here.</p>
                  <div className="mt-4 grid gap-3">
                    {(data?.serviceSongs || []).map((song, index) => (
                      <SharedSongRow key={song.id} song={song} index={index} members={members} leadName={memberLabel(memberById.get(song.lead_member_id))} canEdit={canEdit} busy={busy} onSave={(values) => action("update_song", { serviceSongId: song.id, ...values })} onRemove={() => action("remove_song", { serviceSongId: song.id })} />
                    ))}
                    {!(data?.serviceSongs || []).length ? <p className="text-sm text-white/55">No songs have been added to this service.</p> : null}
                  </div>

                  {canEdit ? (
                    <form onSubmit={submitSong} className="mt-5 grid gap-3 border-t border-white/10 pt-5 md:grid-cols-2">
                      <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-sm text-white" placeholder="Song title" value={newSong.title} onChange={(e) => setNewSong((v) => ({ ...v, title: e.target.value }))} required />
                      <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-sm text-white" placeholder="Artist" value={newSong.artist} onChange={(e) => setNewSong((v) => ({ ...v, artist: e.target.value }))} />
                      <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-sm text-white" placeholder="Key" value={newSong.keyOverride} onChange={(e) => setNewSong((v) => ({ ...v, keyOverride: e.target.value }))} />
                      <select className="h-10 border border-white/15 bg-[#232b34] px-3 text-sm text-white" value={newSong.leadMemberId} onChange={(e) => setNewSong((v) => ({ ...v, leadMemberId: e.target.value }))}>
                        <option value="">Lead vocalist — unassigned</option>
                        {members.map((member) => <option key={member.id} value={member.id}>{memberLabel(member)}</option>)}
                      </select>
                      <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-sm text-white md:col-span-2" placeholder="Arrangement / cue notes" value={newSong.arrangementNotes} onChange={(e) => setNewSong((v) => ({ ...v, arrangementNotes: e.target.value }))} />
                      <button disabled={busy} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50 md:col-span-2">Add Song</button>
                    </form>
                  ) : null}
                </section>

                <section className="border border-white/10 bg-[#303944] p-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">Media Readiness</h2>
                      <p className="mt-1 text-sm text-white/55">Projector, stream mix and livestream slides use the same service plan.</p>
                    </div>
                    {(canEdit || canChecklist) && !(data?.checklistRuns || []).length ? (
                      <button disabled={busy} onClick={() => action("initialize_checklists", { serviceId: selected.id })} className="h-10 border border-[#8ee0c2]/50 px-4 text-sm font-semibold text-[#bff4df] disabled:opacity-50">Prepare Checklists</button>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {(data?.checklistRuns || []).map((run) => {
                      const station = stationById.get(run.station_id);
                      const items = itemsByRun.get(run.id) || [];
                      const completed = items.filter((item) => item.is_complete).length;
                      return (
                        <article key={run.id} className="border border-white/10 bg-[#232b34] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div><h3 className="font-semibold">{station?.name || "Media Station"}</h3><p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#8ee0c2]">{run.status.replace(/_/g, " ")}</p></div>
                            <span className="text-xs text-white/55">{completed}/{items.length}</span>
                          </div>
                          <div className="mt-4 grid gap-2">
                            {items.map((item) => (
                              <label key={item.id} className="flex gap-3 border border-white/8 bg-white/3 px-3 py-2 text-sm">
                                <input type="checkbox" checked={Boolean(item.is_complete)} disabled={busy || !canChecklist} onChange={(e) => action("toggle_checklist_item", { itemId: item.id, isComplete: e.target.checked })} className="mt-0.5 h-4 w-4" />
                                <span className={item.is_complete ? "text-white/45 line-through" : "text-white/80"}>{item.label_snapshot}</span>
                              </label>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                    {!(data?.checklistRuns || []).length ? <p className="text-sm text-white/55 lg:col-span-3">Readiness checklists have not been prepared for this service yet.</p> : null}
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function SharedSongRow({ song, index, members, leadName, canEdit, busy, onSave, onRemove }) {
  const [leadMemberId, setLeadMemberId] = useState(song.lead_member_id || "");
  const [keyOverride, setKeyOverride] = useState(song.key_override || "");
  const [arrangementNotes, setArrangementNotes] = useState(song.arrangement_notes || "");

  useEffect(() => {
    setLeadMemberId(song.lead_member_id || "");
    setKeyOverride(song.key_override || "");
    setArrangementNotes(song.arrangement_notes || "");
  }, [song.id, song.lead_member_id, song.key_override, song.arrangement_notes]);

  if (!canEdit) {
    return (
      <article className="grid gap-2 border border-white/10 bg-[#232b34] p-4 sm:grid-cols-[44px_1fr_auto] sm:items-center">
        <span className="flex h-8 w-8 items-center justify-center bg-[#0f6048] text-sm font-semibold">{index + 1}</span>
        <div><h3 className="font-semibold">{song.title_snapshot}</h3><p className="text-sm text-white/55">{song.artist_snapshot || "Artist not listed"}</p>{song.arrangement_notes ? <p className="mt-1 text-sm text-white/70">{song.arrangement_notes}</p> : null}</div>
        <div className="text-sm sm:text-right"><p className="font-semibold text-[#bff4df]">Lead: {song.lead_member_id ? leadName : "Unassigned"}</p><p className="text-white/55">Key: {song.key_override || "—"}</p></div>
      </article>
    );
  }

  return (
    <article className="border border-white/10 bg-[#232b34] p-4">
      <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0f6048] text-sm font-semibold">{index + 1}</span><div><h3 className="font-semibold">{song.title_snapshot}</h3><p className="text-sm text-white/55">{song.artist_snapshot || "Artist not listed"}</p></div></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_100px_2fr_auto]">
        <select className="h-10 border border-white/15 bg-[#303944] px-3 text-sm text-white" value={leadMemberId} onChange={(e) => setLeadMemberId(e.target.value)}><option value="">Unassigned lead</option>{members.map((member) => <option key={member.id} value={member.id}>{memberLabel(member)}</option>)}</select>
        <input className="h-10 border border-white/15 bg-[#303944] px-3 text-sm text-white" value={keyOverride} onChange={(e) => setKeyOverride(e.target.value)} placeholder="Key" />
        <input className="h-10 border border-white/15 bg-[#303944] px-3 text-sm text-white" value={arrangementNotes} onChange={(e) => setArrangementNotes(e.target.value)} placeholder="Arrangement / cue notes" />
        <div className="flex gap-2"><button disabled={busy} type="button" onClick={() => onSave({ leadMemberId, keyOverride, arrangementNotes })} className="h-10 bg-[#0f6048] px-3 text-sm font-semibold disabled:opacity-50">Save</button><button disabled={busy} type="button" onClick={onRemove} className="h-10 border border-red-400/35 px-3 text-sm font-semibold text-red-200 disabled:opacity-50">Remove</button></div>
      </div>
    </article>
  );
}

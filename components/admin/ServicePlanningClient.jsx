"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function localDateTimeInput(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getNextSundayAtTen() {
  const date = new Date();
  const day = date.getDay();
  let daysUntilSunday = (7 - day) % 7;
  if (daysUntilSunday === 0 && (date.getHours() > 10 || (date.getHours() === 10 && date.getMinutes() > 0))) {
    daysUntilSunday = 7;
  }
  date.setDate(date.getDate() + daysUntilSunday);
  date.setHours(10, 0, 0, 0);
  return localDateTimeInput(date);
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function memberLabel(member) {
  return member?.full_name || member?.username || member?.email || "Member";
}

export function ServicePlanningClient() {
  const [data, setData] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newService, setNewService] = useState({
    title: "Sunday Service",
    startsAt: getNextSundayAtTen(),
    serviceNotes: "",
  });
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    keyOverride: "",
    leadMemberId: "",
    arrangementNotes: "",
  });

  const load = useCallback(async (serviceId = "") => {
    setLoading(true);
    setError("");
    try {
      const query = serviceId ? `?service_id=${encodeURIComponent(serviceId)}` : "";
      const response = await fetch(`/api/admin/service-planning${query}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to load service planning.");
      }
      setData(payload);
      const resolvedId = payload?.selectedService?.id || "";
      setSelectedServiceId(resolvedId);
    } catch (caught) {
      setError(caught?.message || "Unable to load service planning.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action, payload = {}, { reloadServiceId = selectedServiceId } = {}) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/service-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "The service-planning action failed.");
      }
      const nextServiceId = result?.serviceId || reloadServiceId || "";
      setMessage("Saved.");
      await load(nextServiceId);
      return true;
    } catch (caught) {
      setError(caught?.message || "The service-planning action failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const memberById = useMemo(
    () => new Map((data?.members || []).map((member) => [member.id, member])),
    [data?.members],
  );
  const stationById = useMemo(
    () => new Map((data?.stations || []).map((station) => [station.id, station])),
    [data?.stations],
  );
  const checklistItemsByRun = useMemo(() => {
    const map = new Map();
    for (const item of data?.checklistItems || []) {
      if (!map.has(item.run_id)) map.set(item.run_id, []);
      map.get(item.run_id).push(item);
    }
    return map;
  }, [data?.checklistItems]);

  async function createService(event) {
    event.preventDefault();
    const success = await runAction("create_service", newService, { reloadServiceId: "" });
    if (success) {
      setNewService({ title: "Sunday Service", startsAt: getNextSundayAtTen(), serviceNotes: "" });
    }
  }

  async function addSong(event) {
    event.preventDefault();
    if (!selectedServiceId) return;
    const success = await runAction("add_song", { serviceId: selectedServiceId, ...newSong });
    if (success) {
      setNewSong({ title: "", artist: "", keyOverride: "", leadMemberId: "", arrangementNotes: "" });
    }
  }

  if (loading && !data) {
    return <div className="min-h-screen bg-[#232b34] p-6 text-white">Loading Service Planner…</div>;
  }

  const selected = data?.selectedService || null;

  return (
    <div className="min-h-screen bg-[#232b34] text-white">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">Master Admin</p>
            <h1 className="mt-1 text-3xl font-semibold">Service Planner</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
              One shared service plan for Worship, Media and FOH. Build the set, assign the lead vocalist, publish the plan, and run pre-service station checklists.
            </p>
          </div>
          <a href="/admin" className="inline-flex h-10 items-center justify-center border border-white/20 px-4 text-sm font-semibold hover:bg-white/8">
            Back to Admin
          </a>
        </header>

        {error ? <div className="border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        {message ? <div className="border border-emerald-400/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}

        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <section className="border border-white/10 bg-[#303944] p-4">
              <h2 className="text-lg font-semibold">Services</h2>
              <div className="mt-3 grid gap-2">
                {(data?.services || []).length ? (
                  data.services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => load(service.id)}
                      className={`border px-3 py-3 text-left ${selectedServiceId === service.id ? "border-[#8ee0c2] bg-[#0f6048]/35" : "border-white/10 bg-white/4 hover:bg-white/7"}`}
                    >
                      <span className="block font-semibold">{service.title}</span>
                      <span className="mt-1 block text-xs text-white/60">{formatDateTime(service.starts_at)}</span>
                      <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8ee0c2]">{service.status}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-white/60">No services yet. Create the first one below.</p>
                )}
              </div>
            </section>

            <form onSubmit={createService} className="border border-white/10 bg-[#303944] p-4">
              <h2 className="text-lg font-semibold">Create Service</h2>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Title</span>
                  <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={newService.title} onChange={(event) => setNewService((current) => ({ ...current, title: event.target.value }))} required />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Date & Time</span>
                  <input type="datetime-local" className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={newService.startsAt} onChange={(event) => setNewService((current) => ({ ...current, startsAt: event.target.value }))} required />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Service Notes</span>
                  <textarea className="min-h-20 border border-white/15 bg-[#232b34] px-3 py-2 text-white" value={newService.serviceNotes} onChange={(event) => setNewService((current) => ({ ...current, serviceNotes: event.target.value }))} />
                </label>
                <button disabled={busy} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold text-white disabled:opacity-50">Create Service</button>
              </div>
            </form>
          </aside>

          <main className="space-y-5">
            {!selected ? (
              <section className="border border-white/10 bg-[#303944] p-6 text-white/70">Create or select a service to begin planning.</section>
            ) : (
              <>
                <section className="border border-white/10 bg-[#303944] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">{selected.status}</p>
                      <h2 className="mt-1 text-2xl font-semibold">{selected.title}</h2>
                      <p className="mt-1 text-sm text-white/65">{formatDateTime(selected.starts_at)}</p>
                      {selected.service_notes ? <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">{selected.service_notes}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selected.status !== "published" ? (
                        <button disabled={busy} onClick={() => runAction("set_service_status", { serviceId: selected.id, status: "published" })} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50">Publish Plan</button>
                      ) : (
                        <button disabled={busy} onClick={() => runAction("set_service_status", { serviceId: selected.id, status: "draft" })} className="h-10 border border-white/20 px-4 text-sm font-semibold disabled:opacity-50">Return to Draft</button>
                      )}
                      <button disabled={busy} onClick={() => runAction("initialize_checklists", { serviceId: selected.id })} className="h-10 border border-[#8ee0c2]/50 px-4 text-sm font-semibold text-[#bff4df] disabled:opacity-50">Prepare Checklists</button>
                    </div>
                  </div>
                </section>

                <section className="border border-white/10 bg-[#303944] p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">Worship</p>
                      <h2 className="mt-1 text-xl font-semibold">Set List & Lead Vocalists</h2>
                    </div>
                    <span className="text-sm text-white/55">{(data?.serviceSongs || []).length} songs</span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {(data?.serviceSongs || []).map((song, index) => (
                      <SongRow
                        key={song.id}
                        song={song}
                        index={index}
                        members={data?.members || []}
                        leadName={memberLabel(memberById.get(song.lead_member_id))}
                        busy={busy}
                        onSave={(updates) => runAction("update_song", { serviceSongId: song.id, ...updates })}
                        onRemove={() => runAction("remove_song", { serviceSongId: song.id })}
                      />
                    ))}
                    {!(data?.serviceSongs || []).length ? <p className="text-sm text-white/55">No songs have been added yet.</p> : null}
                  </div>

                  <form onSubmit={addSong} className="mt-5 grid gap-3 border-t border-white/10 pt-5 lg:grid-cols-2">
                    <label className="grid gap-1 text-sm">
                      <span className="text-white/70">Song Title</span>
                      <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={newSong.title} onChange={(event) => setNewSong((current) => ({ ...current, title: event.target.value }))} required />
                    </label>
                    <label className="grid gap-1 text-sm">
                      <span className="text-white/70">Artist</span>
                      <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={newSong.artist} onChange={(event) => setNewSong((current) => ({ ...current, artist: event.target.value }))} />
                    </label>
                    <label className="grid gap-1 text-sm">
                      <span className="text-white/70">Key</span>
                      <input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={newSong.keyOverride} onChange={(event) => setNewSong((current) => ({ ...current, keyOverride: event.target.value }))} placeholder="G" />
                    </label>
                    <label className="grid gap-1 text-sm">
                      <span className="text-white/70">Lead Vocalist</span>
                      <select className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={newSong.leadMemberId} onChange={(event) => setNewSong((current) => ({ ...current, leadMemberId: event.target.value }))}>
                        <option value="">Unassigned</option>
                        {(data?.members || []).map((member) => <option key={member.id} value={member.id}>{memberLabel(member)}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm lg:col-span-2">
                      <span className="text-white/70">Arrangement / Service Notes</span>
                      <textarea className="min-h-20 border border-white/15 bg-[#232b34] px-3 py-2 text-white" value={newSong.arrangementNotes} onChange={(event) => setNewSong((current) => ({ ...current, arrangementNotes: event.target.value }))} />
                    </label>
                    <button disabled={busy} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50 lg:col-span-2">Add Song to Service</button>
                  </form>
                </section>

                <section className="border border-white/10 bg-[#303944] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">Media Readiness</p>
                  <h2 className="mt-1 text-xl font-semibold">Station Checklists</h2>
                  <p className="mt-2 text-sm text-white/60">These stations are configuration-backed and can be changed later by Master Admin.</p>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    {(data?.checklistRuns || []).length ? (
                      data.checklistRuns.map((run) => {
                        const station = stationById.get(run.station_id);
                        const items = checklistItemsByRun.get(run.id) || [];
                        const completed = items.filter((item) => item.is_complete).length;
                        return (
                          <div key={run.id} className="border border-white/10 bg-[#232b34] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold">{station?.name || "Media Station"}</h3>
                                <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#8ee0c2]">{run.status.replace(/_/g, " ")}</p>
                              </div>
                              <span className="text-xs text-white/55">{completed}/{items.length}</span>
                            </div>
                            <div className="mt-4 grid gap-2">
                              {items.map((item) => (
                                <label key={item.id} className="flex cursor-pointer gap-3 border border-white/8 bg-white/3 px-3 py-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(item.is_complete)}
                                    disabled={busy}
                                    onChange={(event) => runAction("toggle_checklist_item", { itemId: item.id, isComplete: event.target.checked })}
                                    className="mt-0.5 h-4 w-4"
                                  />
                                  <span className={item.is_complete ? "text-white/45 line-through" : "text-white/80"}>{item.label_snapshot}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="lg:col-span-3 border border-dashed border-white/15 p-5 text-sm text-white/55">
                        Click <strong className="text-white/80">Prepare Checklists</strong> to create this service’s Projector Slides, YouTube/Livestream Mix and Livestream Slides readiness lists.
                      </div>
                    )}
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

function SongRow({ song, index, members, leadName, busy, onSave, onRemove }) {
  const [leadMemberId, setLeadMemberId] = useState(song.lead_member_id || "");
  const [keyOverride, setKeyOverride] = useState(song.key_override || "");
  const [arrangementNotes, setArrangementNotes] = useState(song.arrangement_notes || "");

  useEffect(() => {
    setLeadMemberId(song.lead_member_id || "");
    setKeyOverride(song.key_override || "");
    setArrangementNotes(song.arrangement_notes || "");
  }, [song.id, song.lead_member_id, song.key_override, song.arrangement_notes]);

  return (
    <article className="border border-white/10 bg-[#232b34] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0f6048] text-sm font-semibold">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{song.title_snapshot}</h3>
          <p className="text-sm text-white/55">{song.artist_snapshot || "Artist not listed"} · Lead: {song.lead_member_id ? leadName : "Unassigned"}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_110px_2fr_auto]">
        <select className="h-10 border border-white/15 bg-[#303944] px-3 text-sm text-white" value={leadMemberId} onChange={(event) => setLeadMemberId(event.target.value)}>
          <option value="">Unassigned lead</option>
          {members.map((member) => <option key={member.id} value={member.id}>{memberLabel(member)}</option>)}
        </select>
        <input className="h-10 border border-white/15 bg-[#303944] px-3 text-sm text-white" value={keyOverride} onChange={(event) => setKeyOverride(event.target.value)} placeholder="Key" />
        <input className="h-10 border border-white/15 bg-[#303944] px-3 text-sm text-white" value={arrangementNotes} onChange={(event) => setArrangementNotes(event.target.value)} placeholder="Arrangement / cue notes" />
        <div className="flex gap-2">
          <button type="button" disabled={busy} onClick={() => onSave({ leadMemberId, keyOverride, arrangementNotes })} className="h-10 bg-[#0f6048] px-3 text-sm font-semibold disabled:opacity-50">Save</button>
          <button type="button" disabled={busy} onClick={onRemove} className="h-10 border border-red-400/35 px-3 text-sm font-semibold text-red-200 disabled:opacity-50">Remove</button>
        </div>
      </div>
    </article>
  );
}

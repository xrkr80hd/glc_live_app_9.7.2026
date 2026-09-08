"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function MediaReadinessSetupClient() {
  const [data, setData] = useState({ stations: [], templates: [], items: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newStation, setNewStation] = useState({ name: "", description: "", sortOrder: 40 });
  const [newItemByTemplate, setNewItemByTemplate] = useState({});

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/media-readiness", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Unable to load readiness setup.");
      setData(payload);
    } catch (caught) {
      setError(caught?.message || "Unable to load readiness setup.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function action(name, payload = {}) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/media-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to save readiness setup.");
      setNotice("Saved.");
      await load();
      return true;
    } catch (caught) {
      setError(caught?.message || "Unable to save readiness setup.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const templateByStation = useMemo(() => {
    const map = new Map();
    for (const template of data.templates || []) {
      if (template.is_active && !map.has(template.station_id)) map.set(template.station_id, template);
    }
    return map;
  }, [data.templates]);

  const itemsByTemplate = useMemo(() => {
    const map = new Map();
    for (const item of data.items || []) {
      if (!map.has(item.template_id)) map.set(item.template_id, []);
      map.get(item.template_id).push(item);
    }
    return map;
  }, [data.items]);

  async function createStation(event) {
    event.preventDefault();
    const ok = await action("create_station", newStation);
    if (ok) setNewStation({ name: "", description: "", sortOrder: 40 });
  }

  return (
    <div className="min-h-screen bg-[#232b34] text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">Master Admin</p>
            <h1 className="mt-1 text-3xl font-semibold">Media Readiness Setup</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">Rename, activate or deactivate media stations and edit the checklist volunteers receive before service.</p>
          </div>
          <div className="flex gap-2">
            <a href="/admin/service-planning" className="inline-flex h-10 items-center border border-[#8ee0c2]/40 px-4 text-sm font-semibold text-[#bff4df]">Service Planner</a>
            <a href="/admin" className="inline-flex h-10 items-center border border-white/20 px-4 text-sm font-semibold">Admin Home</a>
          </div>
        </header>

        {error ? <p className="border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</p> : null}
        {notice ? <p className="border border-emerald-400/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">{notice}</p> : null}

        <form onSubmit={createStation} className="grid gap-3 border border-white/10 bg-[#303944] p-5 md:grid-cols-[1fr_2fr_100px_auto] md:items-end">
          <label className="grid gap-1 text-sm"><span className="text-white/70">New Station</span><input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" placeholder="Camera Director" value={newStation.name} onChange={(e) => setNewStation((v) => ({ ...v, name: e.target.value }))} required /></label>
          <label className="grid gap-1 text-sm"><span className="text-white/70">Description</span><input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" placeholder="What this station is responsible for" value={newStation.description} onChange={(e) => setNewStation((v) => ({ ...v, description: e.target.value }))} /></label>
          <label className="grid gap-1 text-sm"><span className="text-white/70">Sort</span><input type="number" className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={newStation.sortOrder} onChange={(e) => setNewStation((v) => ({ ...v, sortOrder: e.target.value }))} /></label>
          <button disabled={busy} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50">Add Station</button>
        </form>

        <div className="grid gap-5">
          {(data.stations || []).map((station) => {
            const template = templateByStation.get(station.id);
            const items = template ? itemsByTemplate.get(template.id) || [] : [];
            return (
              <StationEditor
                key={station.id}
                station={station}
                template={template}
                items={items}
                busy={busy}
                newItem={newItemByTemplate[template?.id] || ""}
                onNewItemChange={(value) => template && setNewItemByTemplate((current) => ({ ...current, [template.id]: value }))}
                onStationSave={(values) => action("update_station", { stationId: station.id, ...values })}
                onItemAdd={async () => {
                  if (!template) return;
                  const label = String(newItemByTemplate[template.id] || "").trim();
                  if (!label) return;
                  const ok = await action("add_item", { templateId: template.id, label });
                  if (ok) setNewItemByTemplate((current) => ({ ...current, [template.id]: "" }));
                }}
                onItemSave={(itemId, values) => action("update_item", { itemId, ...values })}
                onItemRemove={(itemId) => action("remove_item", { itemId })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StationEditor({ station, template, items, busy, newItem, onNewItemChange, onStationSave, onItemAdd, onItemSave, onItemRemove }) {
  const [name, setName] = useState(station.name || "");
  const [description, setDescription] = useState(station.description || "");
  const [sortOrder, setSortOrder] = useState(station.sort_order || 0);
  const [isActive, setIsActive] = useState(Boolean(station.is_active));

  useEffect(() => {
    setName(station.name || "");
    setDescription(station.description || "");
    setSortOrder(station.sort_order || 0);
    setIsActive(Boolean(station.is_active));
  }, [station.id, station.name, station.description, station.sort_order, station.is_active]);

  return (
    <section className={`border bg-[#303944] p-5 ${isActive ? "border-white/10" : "border-white/5 opacity-65"}`}>
      <div className="grid gap-3 lg:grid-cols-[1fr_2fr_90px_auto_auto] lg:items-end">
        <label className="grid gap-1 text-sm"><span className="text-white/70">Station Name</span><input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="grid gap-1 text-sm"><span className="text-white/70">Description</span><input className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label className="grid gap-1 text-sm"><span className="text-white/70">Sort</span><input type="number" className="h-10 border border-white/15 bg-[#232b34] px-3 text-white" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></label>
        <label className="flex h-10 items-center gap-2 border border-white/15 px-3 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active</label>
        <button disabled={busy} type="button" onClick={() => onStationSave({ name, description, sortOrder, isActive })} className="h-10 bg-[#0f6048] px-4 text-sm font-semibold disabled:opacity-50">Save Station</button>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{template?.name || "Checklist"}</h2><p className="text-sm text-white/55">{items.length} items</p></div></div>
        <div className="mt-3 grid gap-2">
          {items.map((item) => <ChecklistItemEditor key={item.id} item={item} busy={busy} onSave={onItemSave} onRemove={onItemRemove} />)}
          {!items.length ? <p className="text-sm text-white/55">No checklist items yet.</p> : null}
        </div>
        {template ? (
          <div className="mt-4 flex gap-2"><input className="h-10 flex-1 border border-white/15 bg-[#232b34] px-3 text-sm text-white" placeholder="Add checklist item" value={newItem} onChange={(e) => onNewItemChange(e.target.value)} /><button type="button" disabled={busy || !newItem.trim()} onClick={onItemAdd} className="h-10 border border-[#8ee0c2]/50 px-4 text-sm font-semibold text-[#bff4df] disabled:opacity-40">Add Item</button></div>
        ) : null}
      </div>
    </section>
  );
}

function ChecklistItemEditor({ item, busy, onSave, onRemove }) {
  const [label, setLabel] = useState(item.label || "");
  const [sortOrder, setSortOrder] = useState(item.sort_order || 0);
  const [isRequired, setIsRequired] = useState(Boolean(item.is_required));

  useEffect(() => { setLabel(item.label || ""); setSortOrder(item.sort_order || 0); setIsRequired(Boolean(item.is_required)); }, [item.id, item.label, item.sort_order, item.is_required]);

  return (
    <div className="grid gap-2 border border-white/8 bg-[#232b34] p-3 md:grid-cols-[1fr_80px_auto_auto_auto] md:items-center">
      <input className="h-9 border border-white/15 bg-[#303944] px-3 text-sm text-white" value={label} onChange={(e) => setLabel(e.target.value)} />
      <input type="number" className="h-9 border border-white/15 bg-[#303944] px-2 text-sm text-white" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} /> Required</label>
      <button type="button" disabled={busy} onClick={() => onSave(item.id, { label, sortOrder, isRequired })} className="h-9 bg-[#0f6048] px-3 text-sm font-semibold disabled:opacity-50">Save</button>
      <button type="button" disabled={busy} onClick={() => onRemove(item.id)} className="h-9 border border-red-400/35 px-3 text-sm font-semibold text-red-200 disabled:opacity-50">Remove</button>
    </div>
  );
}

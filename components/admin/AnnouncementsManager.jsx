"use client";

import { useEffect, useState } from "react";
import { AnnouncementImageCropper } from "@/components/admin/AnnouncementImageCropper";

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function emptyDraft() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return {
    category: "main",
    title: "",
    body: "",
    image_url: "",
    image_alt: "",
    starts_at: new Date(now.getTime() - offset).toISOString().slice(0, 16),
    ends_at: "",
    is_published: true,
  };
}

function itemToDraft(item) {
  return {
    category: item.category || "main",
    title: item.title || "",
    body: item.body || "",
    image_url: item.image_url || "",
    image_alt: item.image_alt || "",
    starts_at: toLocalInput(item.starts_at),
    ends_at: toLocalInput(item.ends_at),
    is_published: item.is_published !== false,
  };
}

export function AnnouncementsManager() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [cropFile, setCropFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function request(url, init) {
    const response = await fetch(url, { ...init, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || "Request failed.");
    return payload;
  }

  async function load() {
    try {
      const payload = await request("/api/admin/announcements?include_unpublished=true&limit=200");
      setItems(payload.announcements || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Unable to load announcements.");
    }
  }

  useEffect(() => { load(); }, []);

  function setField(name, value) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function beginEdit(item) {
    setEditingId(item.id);
    setDraft(itemToDraft(item));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setDraft(emptyDraft());
    setCropFile(null);
  }

  async function uploadCropped(file) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "announcements/images");
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) throw new Error(payload?.error || "Unable to upload image.");
      setField("image_url", payload.url);
      if (!draft.image_alt) setField("image_alt", draft.title || "Liberty Church announcement");
      setCropFile(null);
      setMessage("Image cropped and ready.");
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload image.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) {
      setError("Title and announcement text are required.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    const payload = {
      ...draft,
      starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : new Date().toISOString(),
      ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
    };
    try {
      if (editingId) {
        await request(`/api/admin/announcements/${editingId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("Announcement updated.");
      } else {
        await request("/api/admin/announcements", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("Announcement published.");
      }
      resetForm();
      await load();
    } catch (saveError) {
      setError(saveError.message || "Unable to save announcement.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/announcements/${item.id}`, { method: "DELETE" });
      if (editingId === item.id) resetForm();
      setMessage("Announcement deleted.");
      await load();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete announcement.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#d7e4dc] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2d7a53]">Media Management</p>
            <h1 className="mt-1 text-2xl font-bold text-[#173329]">{editingId ? "Edit Announcement" : "Create Announcement"}</h1>
            <p className="mt-1 text-sm text-[#6f8379]">Main and Youth announcements use the same image size and carousel behavior.</p>
          </div>
          {editingId ? <button type="button" onClick={resetForm} className="rounded-xl border border-[#cbdcd2] px-4 py-2 text-sm font-semibold text-[#52675d]">Cancel Edit</button> : null}
        </div>

        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">
              Where should it appear?
              <select value={draft.category} onChange={(event) => setField("category", event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]">
                <option value="main">Main Church</option>
                <option value="youth">Youth</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">
              Starts
              <input type="datetime-local" value={draft.starts_at} onChange={(event) => setField("starts_at", event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]" />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">
            Title
            <input value={draft.title} onChange={(event) => setField("title", event.target.value)} placeholder="Announcement title" className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">
            Announcement
            <textarea value={draft.body} onChange={(event) => setField("body", event.target.value)} rows={5} placeholder="What does the church need to know?" className="rounded-xl border border-[#cdded4] bg-white px-3 py-2.5 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" />
          </label>

          <div className="grid gap-3 rounded-2xl border border-[#dce8e1] bg-[#f8fbf9] p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="text-sm text-[#173329]">Announcement Image</strong>
                <p className="text-xs text-[#71847b]">Final display size: 1600 × 1000. Crop or show the full photo with blurred fill.</p>
              </div>
              <label className="cursor-pointer rounded-xl bg-[#1f6846] px-4 py-2 text-sm font-bold text-white hover:bg-[#18563a]">
                {draft.image_url ? "Replace Photo" : "Choose Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) setCropFile(file); event.target.value = ""; }} />
              </label>
            </div>
            {draft.image_url ? (
              <div className="overflow-hidden rounded-xl border border-[#cbdcd2] bg-[#eaf2ed]" style={{ aspectRatio: "16 / 10" }}>
                <img src={draft.image_url} alt={draft.image_alt || "Announcement preview"} className="h-full w-full object-cover" />
              </div>
            ) : null}
            {draft.image_url ? <button type="button" onClick={() => setField("image_url", "")} className="justify-self-start text-sm font-semibold text-red-700 hover:underline">Remove image</button> : null}
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">
            Image description for accessibility
            <input value={draft.image_alt} onChange={(event) => setField("image_alt", event.target.value)} placeholder="Describe the image briefly" className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none placeholder:text-[#87988f] focus:border-[#3d8b64]" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-[#355b49]">
              Ends (optional)
              <input type="datetime-local" value={draft.ends_at} onChange={(event) => setField("ends_at", event.target.value)} className="h-11 rounded-xl border border-[#cdded4] bg-white px-3 text-[#173329] outline-none focus:border-[#3d8b64]" />
            </label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-[#d8e5dd] bg-[#f8fbf9] px-3 py-3 text-sm font-semibold text-[#355b49]">
              <input type="checkbox" checked={draft.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-5 w-5 accent-[#1f6846]" />
              Published
            </label>
          </div>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}

          <button type="submit" disabled={busy} className="h-12 rounded-xl bg-[#1f6846] px-5 text-sm font-bold text-white hover:bg-[#18563a] disabled:bg-[#9eb5a8]">
            {busy ? "Saving…" : editingId ? "Save Changes" : "Publish Announcement"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#d7e4dc] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-xl font-bold text-[#173329]">Current Announcements</h2>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="grid gap-3 rounded-2xl border border-[#dce8e1] p-3 sm:grid-cols-[150px_1fr_auto] sm:items-center">
              <div className="overflow-hidden rounded-xl bg-[#edf3ef]" style={{ aspectRatio: "16 / 10" }}>
                {item.image_url ? <img src={item.image_url} alt={item.image_alt || ""} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-[#819289]">No image</div>}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-[#173329]">{item.title}</strong>
                  <span className="rounded-full bg-[#e9f4ed] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#2d7a53]">{item.category === "youth" ? "Youth" : "Main"}</span>
                  {!item.is_published ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Draft</span> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[#6f8379]">{item.body}</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <button type="button" onClick={() => beginEdit(item)} className="rounded-xl border border-[#bcd3c5] px-3 py-2 text-sm font-semibold text-[#1f6846] hover:bg-[#eef6f1]">Edit</button>
                <button type="button" onClick={() => remove(item)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </article>
          ))}
          {!items.length ? <p className="py-8 text-center text-sm text-[#71847b]">No announcements yet.</p> : null}
        </div>
      </section>

      {cropFile ? <AnnouncementImageCropper file={cropFile} onCancel={() => setCropFile(null)} onApply={uploadCropped} /> : null}
    </div>
  );
}

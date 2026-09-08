"use client";

import { useEffect, useMemo, useState } from "react";

const SECTION_LABELS = {
  home_hero: "Homepage Hero",
  home_pastor: "Pastor Section",
  home_discover: "Discover / CTA Section",
};

function inputClass() {
  return "w-full rounded-lg border border-[#CFEAD9] bg-white px-3 py-2.5 text-sm text-[#112016] outline-none focus:border-[#1F8A4C] focus:ring-2 focus:ring-[#1F8A4C]/15";
}

export function HomepageContentManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/site-content-blocks?include_unpublished=true&limit=50", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load homepage content.");
      setItems(result.siteContentBlocks || []);
    } catch (error) {
      setMessage(error.message || "Unable to load homepage content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const orderedItems = useMemo(() => {
    const order = ["home_hero", "home_pastor", "home_discover"];
    return [...items].sort((a, b) => order.indexOf(a.section_key) - order.indexOf(b.section_key));
  }, [items]);

  function updateLocal(id, key, value) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  }

  async function uploadFor(item, field, file, mediaType = null) {
    if (!file) return;
    setSavingId(item.id);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `homepage/${item.section_key}`);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setItems((current) => current.map((entry) => entry.id === item.id ? {
        ...entry,
        [field]: result.url,
        ...(mediaType ? { media_type: mediaType } : {}),
      } : entry));
      setMessage("Upload ready. Tap Save Changes to publish it.");
    } catch (error) {
      setMessage(error.message || "Upload failed.");
    } finally {
      setSavingId("");
    }
  }

  async function save(item) {
    setSavingId(item.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/site-content-blocks/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save homepage content.");
      setItems((current) => current.map((entry) => entry.id === item.id ? result.siteContentBlock : entry));
      setMessage(`${SECTION_LABELS[item.section_key] || "Homepage section"} saved.`);
    } catch (error) {
      setMessage(error.message || "Unable to save homepage content.");
    } finally {
      setSavingId("");
    }
  }

  if (loading) {
    return <div className="rounded-xl border border-[#CFEAD9] bg-white p-5 text-sm text-[#4B6354]">Loading homepage content…</div>;
  }

  return (
    <div className="space-y-5">
      {message ? <div className="rounded-lg border border-[#CFEAD9] bg-[#F0F8F3] px-4 py-3 text-sm font-semibold text-[#16643A]">{message}</div> : null}

      {orderedItems.map((item) => (
        <section key={item.id} className="rounded-xl border border-[#CFEAD9] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1F8A4C]">Homepage</p>
              <h2 className="text-xl font-extrabold text-[#112016]">{SECTION_LABELS[item.section_key] || item.section_key}</h2>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#4B6354]">
              <input type="checkbox" checked={Boolean(item.is_published)} onChange={(event) => updateLocal(item.id, "is_published", event.target.checked)} />
              Published
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
              Small Heading / Eyebrow
              <input className={inputClass()} value={item.eyebrow || ""} onChange={(event) => updateLocal(item.id, "eyebrow", event.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
              Main Heading
              <input className={inputClass()} value={item.title || ""} onChange={(event) => updateLocal(item.id, "title", event.target.value)} />
            </label>
            <label className="sm:col-span-2 grid gap-1.5 text-sm font-semibold text-[#344942]">
              Text
              <textarea className={inputClass()} rows={6} value={item.body || ""} onChange={(event) => updateLocal(item.id, "body", event.target.value)} />
            </label>

            {item.section_key === "home_hero" ? (
              <>
                <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
                  Hero Media Type
                  <select className={inputClass()} value={item.media_type || "video"} onChange={(event) => updateLocal(item.id, "media_type", event.target.value)}>
                    <option value="video">Video</option><option value="image">Image</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
                  Hero Media URL
                  <input className={inputClass()} value={item.media_url || ""} onChange={(event) => updateLocal(item.id, "media_url", event.target.value)} />
                </label>
                <label className="sm:col-span-2 grid gap-1.5 text-sm font-semibold text-[#344942]">
                  Upload New Hero Media
                  <input type="file" accept="image/*,video/*" className={inputClass()} onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const type = file.type.startsWith("image/") ? "image" : "video";
                    uploadFor(item, "media_url", file, type);
                  }} />
                </label>
              </>
            ) : null}

            {item.section_key === "home_pastor" ? (
              <>
                <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
                  Pastor Image URL
                  <input className={inputClass()} value={item.image_url || ""} onChange={(event) => updateLocal(item.id, "image_url", event.target.value)} />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
                  Image Description
                  <input className={inputClass()} value={item.image_alt || ""} onChange={(event) => updateLocal(item.id, "image_alt", event.target.value)} />
                </label>
                <label className="sm:col-span-2 grid gap-1.5 text-sm font-semibold text-[#344942]">
                  Upload New Pastor Image
                  <input type="file" accept="image/*" className={inputClass()} onChange={(event) => uploadFor(item, "image_url", event.target.files?.[0])} />
                </label>
              </>
            ) : null}

            <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
              Button Label
              <input className={inputClass()} value={item.cta_label || ""} onChange={(event) => updateLocal(item.id, "cta_label", event.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#344942]">
              Button Link
              <input className={inputClass()} value={item.cta_url || ""} onChange={(event) => updateLocal(item.id, "cta_url", event.target.value)} />
            </label>
          </div>

          <button type="button" onClick={() => save(item)} disabled={savingId === item.id} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1F8A4C] px-5 text-sm font-bold text-white hover:bg-[#16643A] disabled:opacity-60">
            {savingId === item.id ? "Saving…" : "Save Changes"}
          </button>
        </section>
      ))}
    </div>
  );
}

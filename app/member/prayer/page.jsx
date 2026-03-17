"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ToastMessage } from "@/components/app-shell/ToastMessage";
import { IconMessageCircleHeart, IconPray, IconSend } from "@tabler/icons-react";

const destinations = [
  "Pastor + Prayer Team (Private)",
  "Prayer Wall (Church Can See After Approval)",
];

export default function PrayerPage() {
  const [request, setRequest] = useState("");
  const [destination, setDestination] = useState(destinations[0]);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setToast(null);

    try {
      const response = await fetch("/api/prayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request,
          sharePermission: destination === destinations[1],
          anonymous: postAnonymously,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to send your request right now.");
      }

      setToast({
        title: "Prayer request submitted",
        message: payload.message || "Your request has been shared with the prayer team.",
      });
      setRequest("");
      setDestination(destinations[0]);
      setPostAnonymously(false);
    } catch (error) {
      setToast({
        title: "Unable to submit prayer request",
        message: error.message || "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell navKey="prayer" title="Prayer" subtitle="Share a request and choose visibility.">
      {toast ? (
        <div className="lc-toast-wrap">
          <ToastMessage title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      ) : null}

      <BackRow fallbackHref="/member" />

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Submit Prayer Request</h2>
          <p className="lc-muted">Share a request privately or send it through for prayer wall review.</p>
        </div>

        <form className="lc-form-grid" onSubmit={handleSubmit}>
          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="prayer-request-text">Prayer Request</label>
            <textarea
              id="prayer-request-text"
              className="lc-textarea"
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              placeholder="Share your prayer request here. You can keep it private or send it for prayer wall review."
              required
            />
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="prayer-destination">Destination</label>
            <select id="prayer-destination" className="lc-select" value={destination} onChange={(event) => setDestination(event.target.value)}>
              {destinations.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <label className="lc-checkbox-row" htmlFor="post-anonymously">
            <input
              id="post-anonymously"
              type="checkbox"
              checked={postAnonymously}
              onChange={(event) => setPostAnonymously(event.target.checked)}
            />
            <span>Post Anonymously</span>
          </label>

          <button type="submit" className="lc-action-btn primary lc-prayer-submit-btn" disabled={isSaving}>
            <IconSend size={18} stroke={1.8} />
            <span>{isSaving ? "Submitting..." : "Submit Prayer Request"}</span>
          </button>
        </form>
      </section>

      <section className="lc-card alt">
        <div className="lc-announcement-meta">
          <IconPray size={16} stroke={1.8} />
          <span>Prayer Wall submissions remain moderated before public display.</span>
        </div>
        <Link href="/member/prayer/wall" className="lc-action-link ghost lc-prayer-wall-link">
          <IconMessageCircleHeart size={18} stroke={1.8} />
          <span>View Prayer Wall</span>
        </Link>
      </section>
    </AppShell>
  );
}

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
  const [showToast, setShowToast] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setShowToast(true);
  }

  return (
    <AppShell navKey="prayer" title="Prayer" subtitle="Submit a prayer request and choose where it should go.">
      {showToast ? (
        <div className="lc-toast-wrap">
          <ToastMessage
            title="Prayer request submitted"
            message="The success state is a toast on this route, not a separate page."
            onClose={() => setShowToast(false)}
          />
        </div>
      ) : null}

      <BackRow fallbackHref="/" />

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
              placeholder="[PRAYER_REQUEST_TEXT]"
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

          <div className="lc-button-row">
            <button type="submit" className="lc-action-btn primary">
              <IconSend size={18} stroke={1.8} />
              <span>Submit Prayer Request</span>
            </button>
            <Link href="/prayer/wall" className="lc-action-link ghost">
              <IconMessageCircleHeart size={18} stroke={1.8} />
              <span>View Prayer Wall</span>
            </Link>
          </div>
        </form>
      </section>

      <section className="lc-card alt">
        <div className="lc-announcement-meta">
          <IconPray size={16} stroke={1.8} />
          <span>Prayer Wall submissions remain moderated before public display.</span>
        </div>
      </section>
    </AppShell>
  );
}

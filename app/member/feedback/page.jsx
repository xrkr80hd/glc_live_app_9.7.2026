"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ToastMessage } from "@/components/app-shell/ToastMessage";
import { IconBug, IconSend } from "@tabler/icons-react";

const categoryOptions = [
  { value: "bug", label: "Bug" },
  { value: "ui", label: "UI Issue" },
  { value: "idea", label: "Suggestion" },
  { value: "other", label: "Other" },
];

const severityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function MemberFeedbackPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    route: "",
    category: "bug",
    severity: "medium",
    message: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/member-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to save feedback right now.");
      }

      setToast({
        title: "Feedback saved",
        message: payload.message || "Your feedback has been saved for the team.",
      });
      setForm({
        name: "",
        email: "",
        route: "",
        category: "bug",
        severity: "medium",
        message: "",
      });
    } catch (error) {
      setToast({
        title: "Unable to save feedback",
        message: error.message || "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell navKey="more" title="Report a Problem" subtitle="Follow the steps below." showProfileShortcut={false}>
      {toast ? (
        <div className="lc-toast-wrap">
          <ToastMessage
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      ) : null}

      <BackRow fallbackHref="/member/more" useHistory={false} />

      <section className="lc-card alt">
        <div className="lc-announcement-meta">
          <IconBug size={16} stroke={1.8} />
          <span>Send a report in order so we can review it quickly.</span>
        </div>
      </section>

      <section className="lc-card lc-feedback-form-card">
        <div className="lc-section-head">
          <h2>Send a report</h2>
          <p className="lc-muted">Follow the steps in order.</p>
        </div>

        <form className="lc-form-grid lc-feedback-form" onSubmit={handleSubmit}>
          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-name">1. Name</label>
            <input id="feedback-name" className="lc-input" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-email">2. Email</label>
            <input id="feedback-email" className="lc-input" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-route">3. Screen or Route</label>
            <input
              id="feedback-route"
              className="lc-input"
              value={form.route}
              onChange={(event) => updateField("route", event.target.value)}
              placeholder="/member/profile or Home"
            />
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-category">4. Type</label>
            <select id="feedback-category" className="lc-select" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-severity">5. Severity</label>
            <select id="feedback-severity" className="lc-select" value={form.severity} onChange={(event) => updateField("severity", event.target.value)}>
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-message">6. What happened?</label>
            <textarea
              id="feedback-message"
              className="lc-textarea"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Example: my profile photo saved, but it still did not show in the top-right corner."
              required
            />
          </div>

          <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
            <IconSend size={18} stroke={1.8} />
            <span>{isSaving ? "Saving..." : "Send Report"}</span>
          </button>
        </form>
      </section>
    </AppShell>
  );
}

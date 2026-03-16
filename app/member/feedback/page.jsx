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
    <AppShell navKey="more" title="Beta Feedback" subtitle="Report bugs, layout issues, or ideas while the test build is in use." showProfileShortcut={false}>
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
          <span>Use this screen to flag broken flows, visual issues, missing content, or tester ideas.</span>
        </div>
      </section>

      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Send Test Feedback</h2>
          <p className="lc-muted">Keep notes short and specific so we can fix things quickly.</p>
        </div>

        <form className="lc-form-grid" onSubmit={handleSubmit}>
          <div className="lc-form-grid two-up">
            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="feedback-name">Name</label>
              <input id="feedback-name" className="lc-input" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </div>
            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="feedback-email">Email</label>
              <input id="feedback-email" className="lc-input" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </div>
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-route">Screen or Route</label>
            <input
              id="feedback-route"
              className="lc-input"
              value={form.route}
              onChange={(event) => updateField("route", event.target.value)}
              placeholder="/member/profile or Home screen"
            />
          </div>

          <div className="lc-form-grid two-up">
            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="feedback-category">Type</label>
              <select id="feedback-category" className="lc-select" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="feedback-severity">Severity</label>
              <select id="feedback-severity" className="lc-select" value={form.severity} onChange={(event) => updateField("severity", event.target.value)}>
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="feedback-message">What happened?</label>
            <textarea
              id="feedback-message"
              className="lc-textarea"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Example: the profile image uploader looks broken on iPhone Safari and the button falls out of alignment."
              required
            />
          </div>

          <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
            <IconSend size={18} stroke={1.8} />
            <span>{isSaving ? "Saving..." : "Send Feedback"}</span>
          </button>
        </form>
      </section>
    </AppShell>
  );
}

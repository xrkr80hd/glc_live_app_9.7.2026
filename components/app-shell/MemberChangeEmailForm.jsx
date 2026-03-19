"use client";

import Link from "next/link";
import { useState } from "react";
import { IconMail } from "@tabler/icons-react";
import { ToastMessage } from "@/components/app-shell/ToastMessage";

export function MemberChangeEmailForm({ currentEmail = "" }) {
  const [nextEmail, setNextEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setToast(null);

    try {
      const response = await fetch("/api/member-auth/email-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextEmail,
          currentPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to start email change right now.");
      }

      setToast({
        title: "Check your email",
        message: payload.message || "Use the email link to confirm your new sign-in address.",
      });
      setCurrentPassword("");
      setNextEmail("");
    } catch (requestError) {
      setToast({
        title: "Unable to start email change",
        message: requestError.message || "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {toast ? (
        <div className="lc-toast-wrap">
          <ToastMessage title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      ) : null}

      <section className="lc-card">
        <form className="lc-form-grid" onSubmit={handleSubmit}>
          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="member-current-email">Current Email</label>
            <input
              id="member-current-email"
              className="lc-input"
              type="email"
              value={currentEmail}
              readOnly
              aria-readonly="true"
            />
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="member-next-email">New Email</label>
            <input
              id="member-next-email"
              className="lc-input"
              type="email"
              value={nextEmail}
              onChange={(event) => setNextEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="member-email-change-password">Current Password</label>
            <div className="lc-password-input">
              <input
                id="member-email-change-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lc-password-toggle"
                onClick={() => setShowCurrentPassword((current) => !current)}
                aria-label={`${showCurrentPassword ? "Hide" : "Show"} password`}
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="lc-button-row">
            <Link href="/member/profile" className="lc-action-link ghost">
              Cancel
            </Link>
            <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
              <IconMail size={18} stroke={1.8} />
              <span>{isSaving ? "Sending..." : "Change Email"}</span>
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

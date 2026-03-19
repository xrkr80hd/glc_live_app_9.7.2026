"use client";

import Link from "next/link";
import { useState } from "react";
import { IconKey, IconMail } from "@tabler/icons-react";

export function MemberForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/member-auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to send reset email right now.");
      }

      setMessage(payload.message || "If that email exists, a reset link has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Unable to send reset email right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="lc-auth-shell">
      <section className="lc-auth-card">
        <div className="lc-auth-copy">
          <span className="lc-hero-eyebrow">
            <IconKey size={14} stroke={1.8} />
            Member Access
          </span>
          <h1>Reset Password</h1>
          <p className="lc-muted">Enter your sign-in email and we'll send your reset link.</p>
        </div>

        <form className="lc-form-grid" onSubmit={handleSubmit}>
          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="member-reset-email">Email</label>
            <div className="lc-password-input">
              <input
                id="member-reset-email"
                className="lc-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
              <span className="lc-password-input-icon" aria-hidden="true">
                <IconMail size={16} stroke={1.8} />
              </span>
            </div>
          </div>

          <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
            {isSaving ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {error ? <p className="lc-auth-message">{error}</p> : null}
        {message ? <p className="lc-auth-note">{message}</p> : null}

        <Link href="/member-access" className="lc-action-link ghost">
          Back to Member Login
        </Link>
      </section>
    </main>
  );
}

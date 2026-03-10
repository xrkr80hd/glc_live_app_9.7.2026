"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMail, IconRefreshAlert } from "@tabler/icons-react";
import styles from "./AdminLoginForm.module.css";

export function AdminForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [debugLink, setDebugLink] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setDebugLink("");

    try {
      const response = await fetch("/api/admin/auth/request-password-reset", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.message || payload?.error || "Unable to request password reset.");
        return;
      }

      setMessage(payload?.message || "If that account exists, a reset email was sent.");
      if (payload?.resetUrl) {
        setDebugLink(payload.resetUrl);
      }
    } catch {
      setError("Network error while requesting reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginCard}>
        <div className={styles.titleWrap}>
          <span className={styles.iconBadge} aria-hidden="true">
            <IconRefreshAlert size={24} stroke={1.8} />
          </span>
          <h1>Reset Admin Password</h1>
          <p>Enter your admin email or username. We&apos;ll send a password reset link.</p>
        </div>

        <form onSubmit={onSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span>
              <IconMail size={16} stroke={1.8} aria-hidden="true" />
              Email or Username
            </span>
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              disabled={loading}
              placeholder="you@example.com or username"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}
          {debugLink ? (
            <p className={styles.success}>
              Reset Link: <a href={debugLink}>{debugLink}</a>
            </p>
          ) : null}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <Link href="/admin/login" className={styles.secondaryLink}>
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}

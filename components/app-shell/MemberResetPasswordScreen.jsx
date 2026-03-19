"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconLockPassword } from "@tabler/icons-react";

function PasswordField({ id, label, value, onChange, visible, onToggle }) {
  return (
    <div className="lc-form-field">
      <label className="lc-field-label" htmlFor={id}>{label}</label>
      <div className="lc-password-input">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          autoComplete="new-password"
        />
        <button
          type="button"
          className="lc-password-toggle"
          onClick={onToggle}
          aria-label={`${visible ? "Hide" : "Show"} password`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export function MemberResetPasswordScreen({ initialError = "" }) {
  const router = useRouter();
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNextPassword, setShowNextPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/member-auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextPassword,
          confirmPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to reset your password right now.");
      }

      const redirectTo = payload.redirectTo || "/member-access?passwordReset=1";
      setMessage(payload.message || "Your password has been reset.");
      setNextPassword("");
      setConfirmPassword("");
      router.replace(redirectTo);
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || "Unable to reset your password right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="lc-auth-shell">
      <section className="lc-auth-card">
        <div className="lc-auth-copy">
          <span className="lc-hero-eyebrow">
            <IconLockPassword size={14} stroke={1.8} />
            Member Access
          </span>
          <h1>Create New Password</h1>
          <p className="lc-muted">Enter and confirm your new password to finish recovery.</p>
        </div>

        <form className="lc-form-grid" onSubmit={handleSubmit}>
          <PasswordField
            id="member-reset-new-password"
            label="New Password"
            value={nextPassword}
            onChange={(event) => setNextPassword(event.target.value)}
            visible={showNextPassword}
            onToggle={() => setShowNextPassword((current) => !current)}
          />
          <PasswordField
            id="member-reset-confirm-password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((current) => !current)}
          />

          <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save New Password"}
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

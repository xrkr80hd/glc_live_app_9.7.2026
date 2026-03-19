"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconKey, IconLockPassword } from "@tabler/icons-react";
import styles from "./AdminLoginForm.module.css";

export function AdminResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromQuery = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is required.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.message || payload?.error || "Unable to reset password.");
        return;
      }

      setMessage(payload?.message || "Password reset successful.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error while resetting password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginCard}>
        <div className={styles.titleWrap}>
          <span className={styles.iconBadge} aria-hidden="true">
            <IconKey size={24} stroke={1.8} />
          </span>
          <h1>Create New Password</h1>
          <p>Enter your reset token and choose a new admin password.</p>
        </div>

        <form onSubmit={onSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span>
              <IconKey size={16} stroke={1.8} aria-hidden="true" />
              Reset Token
            </span>
            <input value={token} onChange={(event) => setToken(event.target.value)} required disabled={loading} placeholder="Paste reset token" />
          </label>

          <label className={styles.field}>
            <span>
              <IconLockPassword size={16} stroke={1.8} aria-hidden="true" />
              New Password
            </span>
            <div className={styles.passwordWrap}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={`${showPassword ? "Hide" : "Show"} password`}
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className={styles.field}>
            <span>
              <IconLockPassword size={16} stroke={1.8} aria-hidden="true" />
              Confirm Password
            </span>
            <div className={styles.passwordWrap}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
                placeholder="Re-enter password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={`${showConfirmPassword ? "Hide" : "Show"} password`}
                disabled={loading}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}
          {message ? <p className={styles.success}>{message}</p> : null}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Saving..." : "Reset Password"}
          </button>

          <Link href="/admin/login" className={styles.secondaryLink}>
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}

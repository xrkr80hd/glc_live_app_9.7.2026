"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertCircle, IconLockPassword, IconLogin2, IconShieldCheck, IconUser } from "@tabler/icons-react";
import styles from "./AdminLoginForm.module.css";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.message || payload?.error || "Login failed.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error while signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginCard}>
        <div className={styles.titleWrap}>
          <span className={styles.iconBadge} aria-hidden="true">
            <IconShieldCheck size={24} stroke={1.8} />
          </span>
          <h1>Admin Login</h1>
          <p>Sign in to manage church content, livestream settings, and request inboxes.</p>
        </div>

        <form onSubmit={onSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span>
              <IconUser size={16} stroke={1.8} aria-hidden="true" />
              Username
            </span>
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              disabled={loading}
              placeholder="Admin username"
            />
          </label>

          <label className={styles.field}>
            <span>
              <IconLockPassword size={16} stroke={1.8} aria-hidden="true" />
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              placeholder="Admin password"
            />
          </label>

          {error ? (
            <p className={styles.error} role="alert">
              <IconAlertCircle size={16} stroke={1.8} aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            <IconLogin2 size={18} stroke={1.8} aria-hidden="true" />
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}


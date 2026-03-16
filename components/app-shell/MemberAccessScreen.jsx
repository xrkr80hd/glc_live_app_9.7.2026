"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconKey,
  IconLogin2,
  IconMailCheck,
  IconShieldCheck,
  IconUserPlus,
} from "@tabler/icons-react";

const initialSignIn = {
  email: "",
  password: "",
};

const initialCreate = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function MemberAccessScreen({ initialView = "signin", initialMessage = "" }) {
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [signIn, setSignIn] = useState(initialSignIn);
  const [create, setCreate] = useState(initialCreate);
  const [message, setMessage] = useState(initialMessage);
  const [isSaving, setIsSaving] = useState(false);

  function resetMessage() {
    setMessage("");
  }

  async function handleSignIn(event) {
    event.preventDefault();
    setIsSaving(true);
    resetMessage();

    try {
      const response = await fetch("/api/member-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signIn),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to sign in right now.");
      }

      router.push("/member");
      router.refresh();
    } catch (error) {
      setMessage(error.message || "Unable to sign in right now.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    resetMessage();

    if (create.password !== create.confirmPassword) {
      setMessage("Your password and confirmation need to match.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/member-auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: create.fullName,
          email: create.email,
          phone: create.phone,
          password: create.password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create your account right now.");
      }

      setView("check-email");
      setMessage(data.message || "Check your email to verify your account.");
      setSignIn((current) => ({
        ...current,
        email: create.email,
      }));
    } catch (error) {
      setMessage(error.message || "Unable to create your account right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function renderStatusCard() {
    if (view === "check-email") {
      return (
        <section className="lc-form-grid">
          <div className="lc-auth-note">
            <div className="lc-announcement-meta">
              <IconMailCheck size={16} stroke={1.8} />
              <span>Check your email and open the verification link to finish creating your account.</span>
            </div>
          </div>
          <button
            type="button"
            className="lc-action-btn primary"
            onClick={() => {
              resetMessage();
              setView("signin");
            }}
          >
            Back to Login
          </button>
        </section>
      );
    }

    if (view === "verified") {
      return (
        <section className="lc-form-grid">
          <div className="lc-auth-note">
            <div className="lc-announcement-meta">
              <IconCheck size={16} stroke={1.8} />
              <span>Your email has been verified. You can sign in now.</span>
            </div>
          </div>
          <button
            type="button"
            className="lc-action-btn primary"
            onClick={() => {
              resetMessage();
              setView("signin");
            }}
          >
            Back to Login
          </button>
        </section>
      );
    }

    return null;
  }

  return (
    <main className="lc-auth-shell">
      <section className="lc-auth-card">
        <div className="lc-auth-copy">
          <span className="lc-hero-eyebrow">
            <IconKey size={14} stroke={1.8} />
            Member Beta
          </span>
          <h1>Member Access</h1>
          <p className="lc-muted">
            Create your account, verify your email, and sign in with your email address and password.
          </p>
        </div>

        <section className="lc-auth-note">
          <div className="lc-announcement-meta">
            <IconShieldCheck size={16} stroke={1.8} />
            <span>This beta is for Liberty Church members and trusted testers.</span>
          </div>
        </section>

        {view === "signin" || view === "create" ? (
          <>
            <div className="lc-tab-row" role="tablist" aria-label="Member access mode">
              <button
                type="button"
                className={`lc-tab${view === "signin" ? " is-selected" : ""}`}
                onClick={() => {
                  resetMessage();
                  setView("signin");
                }}
              >
                <IconLogin2 size={16} stroke={1.8} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`lc-tab${view === "create" ? " is-selected" : ""}`}
                onClick={() => {
                  resetMessage();
                  setView("create");
                }}
              >
                <IconUserPlus size={16} stroke={1.8} />
                <span>Create Account</span>
              </button>
            </div>

            {view === "signin" ? (
              <form className="lc-form-grid" onSubmit={handleSignIn}>
                <div className="lc-form-field">
                  <label className="lc-field-label" htmlFor="member-signin-email">Email</label>
                  <input
                    id="member-signin-email"
                    className="lc-input"
                    type="email"
                    value={signIn.email}
                    onChange={(event) => setSignIn((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <div className="lc-form-field">
                  <label className="lc-field-label" htmlFor="member-signin-password">Password</label>
                  <input
                    id="member-signin-password"
                    type="password"
                    className="lc-input"
                    value={signIn.password}
                    onChange={(event) => setSignIn((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
                  {isSaving ? "Signing In..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form className="lc-form-grid" onSubmit={handleCreateAccount}>
                <div className="lc-form-field">
                  <label className="lc-field-label" htmlFor="member-create-name">Full Name</label>
                  <input
                    id="member-create-name"
                    className="lc-input"
                    value={create.fullName}
                    onChange={(event) => setCreate((current) => ({ ...current, fullName: event.target.value }))}
                    required
                  />
                </div>
                <div className="lc-form-field">
                  <label className="lc-field-label" htmlFor="member-create-email">Email</label>
                  <input
                    id="member-create-email"
                    className="lc-input"
                    type="email"
                    value={create.email}
                    onChange={(event) => setCreate((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <div className="lc-form-field">
                  <label className="lc-field-label" htmlFor="member-create-phone">Phone</label>
                  <input
                    id="member-create-phone"
                    className="lc-input"
                    value={create.phone}
                    onChange={(event) => setCreate((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Optional phone number"
                  />
                </div>
                <div className="lc-form-field">
                  <label className="lc-field-label" htmlFor="member-create-password">Password</label>
                  <input
                    id="member-create-password"
                    type="password"
                    className="lc-input"
                    value={create.password}
                    onChange={(event) => setCreate((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                </div>
                <div className="lc-form-field">
                  <label className="lc-field-label" htmlFor="member-create-confirm-password">Confirm Password</label>
                  <input
                    id="member-create-confirm-password"
                    type="password"
                    className="lc-input"
                    value={create.confirmPassword}
                    onChange={(event) => setCreate((current) => ({ ...current, confirmPassword: event.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Account"}
                </button>
              </form>
            )}
          </>
        ) : (
          renderStatusCard()
        )}

        {message ? <p className="lc-auth-message">{message}</p> : null}

        <section className="lc-auth-note">
          <div className="lc-announcement-meta">
            <IconCheck size={16} stroke={1.8} />
            <span>After you sign in, open More and use the install card to save the member area to your home screen.</span>
          </div>
        </section>
      </section>
    </main>
  );
}

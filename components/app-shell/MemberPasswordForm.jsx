"use client";

import { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff, IconLockPassword } from "@tabler/icons-react";
import { ToastMessage } from "@/components/app-shell/ToastMessage";

export function MemberPasswordForm() {
  const [visibility, setVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [form, setForm] = useState({
    currentPassword: "",
    nextPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function toggleVisibility(key) {
    setVisibility((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setToast(null);

    try {
      const response = await fetch("/api/member-auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to update your password right now.");
      }

      setToast({
        title: "Password updated",
        message: payload.message || "Your new password has been saved.",
      });
      setForm({
        currentPassword: "",
        nextPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setToast({
        title: "Unable to update password",
        message: error.message || "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function renderPasswordField(id, label, key) {
    const isVisible = visibility[key];
    const fieldName = key === "current" ? "currentPassword" : key === "next" ? "nextPassword" : "confirmPassword";

    return (
      <div className="lc-form-field">
        <label className="lc-field-label" htmlFor={id}>{label}</label>
        <div className="lc-password-input">
          <input
            id={id}
            type={isVisible ? "text" : "password"}
            value={form[fieldName]}
            onChange={(event) => updateField(fieldName, event.target.value)}
            required
          />
          <button type="button" onClick={() => toggleVisibility(key)} aria-label={`Toggle ${label.toLowerCase()} visibility`}>
            {isVisible ? <IconEyeOff size={18} stroke={1.8} /> : <IconEye size={18} stroke={1.8} />}
          </button>
        </div>
      </div>
    );
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
          {renderPasswordField("current-password", "Current Password", "current")}
          {renderPasswordField("new-password", "New Password", "next")}
          {renderPasswordField("confirm-password", "Confirm New Password", "confirm")}
          <div className="lc-button-row">
            <Link href="/member/profile" className="lc-action-link ghost">
              Cancel
            </Link>
            <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
              <IconLockPassword size={18} stroke={1.8} />
              <span>{isSaving ? "Updating..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

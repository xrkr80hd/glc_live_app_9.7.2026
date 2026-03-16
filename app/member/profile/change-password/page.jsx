"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export default function ChangePasswordPage() {
  const [visibility, setVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  function toggleVisibility(key) {
    setVisibility((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function renderPasswordField(id, label, key) {
    const isVisible = visibility[key];

    return (
      <div className="lc-form-field">
        <label className="lc-field-label" htmlFor={id}>{label}</label>
        <div className="lc-password-input">
          <input id={id} type={isVisible ? "text" : "password"} placeholder="" />
          <button type="button" onClick={() => toggleVisibility(key)} aria-label={`Toggle ${label.toLowerCase()} visibility`}>
            {isVisible ? <IconEyeOff size={18} stroke={1.8} /> : <IconEye size={18} stroke={1.8} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell navKey="more" title="Change Password" subtitle="UI-only password update screen." showProfileShortcut={false}>
      <BackRow fallbackHref="/member/profile" useHistory={false} />

      <section className="lc-card">
        <div className="lc-form-grid">
          {renderPasswordField("current-password", "Current Password", "current")}
          {renderPasswordField("new-password", "New Password", "next")}
          {renderPasswordField("confirm-password", "Confirm New Password", "confirm")}
          <div className="lc-button-row">
            <Link href="/member/profile" className="lc-action-link ghost">
              Cancel
            </Link>
            <button type="button" className="lc-action-btn primary">
              Update Password
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

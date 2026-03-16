"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { IconCheck, IconPhoto, IconUpload } from "@tabler/icons-react";
import { ToastMessage } from "@/components/app-shell/ToastMessage";

export function MemberProfileForm({ member }) {
  const uploadInputId = useId();
  const [form, setForm] = useState({
    fullName: member.fullName || "",
    email: member.email || "",
    phone: member.phone || "",
  });
  const [selectedFileName, setSelectedFileName] = useState("");
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
    setToast(null);

    try {
      const response = await fetch("/api/member-auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to save your profile right now.");
      }

      setToast({
        title: "Profile updated",
        message: payload.message || "Your profile changes were saved.",
      });
    } catch (error) {
      setToast({
        title: "Unable to save",
        message: error.message || "Please try again in a moment.",
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
          <div className="lc-form-grid two-up">
            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="edit-profile-name">Full Name</label>
              <input
                id="edit-profile-name"
                className="lc-input"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                required
              />
            </div>
            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="edit-profile-email">Email</label>
              <input
                id="edit-profile-email"
                className="lc-input"
                type="email"
                value={form.email}
                readOnly
                aria-readonly="true"
              />
              <span className="lc-muted">This is the email you use to sign in.</span>
            </div>
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="edit-profile-phone">Phone</label>
            <input
              id="edit-profile-phone"
              className="lc-input"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Optional phone number"
            />
          </div>

          <div className="lc-upload-panel">
            <div className="lc-upload-panel-head">
              <div className="lc-section-head">
                <h2>Profile Photo</h2>
                <p className="lc-muted">Choose a photo now. Profile photo syncing is the next step in beta.</p>
              </div>
            </div>
            <div className="lc-upload-dropzone">
              <span className="lc-upload-icon">
                <IconPhoto size={28} stroke={1.8} />
              </span>
              <strong>Upload a profile photo</strong>
              <span className="lc-muted">JPG or PNG works best for the member app.</span>
              <label htmlFor={uploadInputId} className="lc-upload-browse">
                <IconUpload size={18} stroke={1.8} />
                <span>Browse Files</span>
              </label>
              <input
                id={uploadInputId}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="lc-hidden-note"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setSelectedFileName(file?.name || "");
                }}
              />
              <span className="lc-upload-helper">
                {selectedFileName ? `Selected: ${selectedFileName}` : "No file selected yet"}
              </span>
            </div>
          </div>

          <div className="lc-button-row">
            <Link href="/member/profile" className="lc-action-link ghost">
              Cancel
            </Link>
            <button type="submit" className="lc-action-btn primary" disabled={isSaving}>
              <IconCheck size={18} stroke={1.8} />
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>

          <Link href="/member/profile/change-password" className="lc-action-link secondary">
            Change Password
          </Link>
        </form>
      </section>
    </>
  );
}

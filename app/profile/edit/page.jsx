import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ProfileCard } from "@/components/app-shell/ProfileCard";
import { profilePlaceholders } from "@/lib/mobile-app-content";

export default function EditProfilePage() {
  return (
    <AppShell navKey="more" title="Edit Profile" subtitle="Update member details and profile photo." showProfileShortcut={false}>
      <BackRow fallbackHref="/profile" useHistory={false} />

      <ProfileCard name={profilePlaceholders.name} email={profilePlaceholders.email} uploadLabel="Upload Profile Photo" />

      <section className="lc-card">
        <form className="lc-form-grid">
          <div className="lc-form-grid two-up">
            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="edit-profile-name">Name</label>
              <input id="edit-profile-name" className="lc-input" defaultValue={profilePlaceholders.name} />
            </div>
            <div className="lc-form-field">
              <label className="lc-field-label" htmlFor="edit-profile-email">Email</label>
              <input id="edit-profile-email" className="lc-input" defaultValue={profilePlaceholders.email} />
            </div>
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="edit-profile-phone">Phone</label>
            <input id="edit-profile-phone" className="lc-input" placeholder="[USER_PHONE]" />
          </div>

          <div className="lc-form-field">
            <label className="lc-field-label" htmlFor="edit-profile-photo">Profile Photo Upload</label>
            <input id="edit-profile-photo" type="file" accept="image/*" />
          </div>

          <div className="lc-button-row">
            <Link href="/profile" className="lc-action-link ghost">
              Cancel
            </Link>
            <button type="button" className="lc-action-btn primary">
              Save Profile
            </button>
          </div>

          <Link href="/profile/change-password" className="lc-action-link secondary">
            Change Password
          </Link>
        </form>
      </section>
    </AppShell>
  );
}

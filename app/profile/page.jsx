import { AppShell } from "@/components/app-shell/AppShell";
import { ProfileCard } from "@/components/app-shell/ProfileCard";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import { profilePlaceholders } from "@/lib/mobile-app-content";
import { IconEdit, IconLockPassword, IconLogout2, IconUsersGroup } from "@tabler/icons-react";

export default function ProfilePage() {
  return (
    <AppShell navKey="more" title="Profile" subtitle="Member identity hub." showProfileShortcut={false}>
      <ProfileCard
        name={profilePlaceholders.name}
        email={profilePlaceholders.email}
        footer={<span className="lc-upload-badge">Profile photos are supported for all members</span>}
      />

      <section className="lc-stack">
        <SettingsRow icon={IconEdit} label="Edit Profile" description="Update profile details and photo upload controls." href="/profile/edit" />
        <SettingsRow icon={IconUsersGroup} label="Church Directory" description="Open the read-only directory view." href="/directory" />
        <SettingsRow icon={IconLockPassword} label="Change Password" description="Open the password update screen." href="/profile/change-password" />
      </section>

      <button type="button" className="lc-action-btn ghost">
        <IconLogout2 size={18} stroke={1.8} />
        <span>Logout</span>
      </button>
    </AppShell>
  );
}
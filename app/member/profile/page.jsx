import { AppShell } from "@/components/app-shell/AppShell";
import { ProfileCard } from "@/components/app-shell/ProfileCard";
import { MemberLogoutButton } from "@/components/app-shell/MemberLogoutButton";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";
import { IconEdit, IconLockPassword, IconUsersGroup } from "@tabler/icons-react";

export default async function ProfilePage() {
  const current = await getCurrentMemberFromServerCookies();
  const member = current?.member;

  return (
    <AppShell navKey="more" title="Profile" subtitle="Member identity hub." showProfileShortcut={false}>
      <ProfileCard
        name={member?.full_name || current?.session?.fullName || "Liberty Church Member"}
        email={member?.email || current?.session?.email || "member@golibertychurch.com"}
        footer={
          <div className="lc-inline-stack">
            <span className="lc-upload-badge">@{member?.username || current?.session?.username || "member"}</span>
            {member?.phone ? <span className="lc-upload-badge">{member.phone}</span> : null}
          </div>
        }
      />

      <section className="lc-stack">
        <SettingsRow icon={IconEdit} label="Edit Profile" description="Update profile details and photo upload controls." href="/member/profile/edit" />
        <SettingsRow icon={IconUsersGroup} label="Church Directory" description="Open the read-only directory view." href="/member/directory" />
        <SettingsRow icon={IconLockPassword} label="Change Password" description="Open the password update screen." href="/member/profile/change-password" />
      </section>

      <MemberLogoutButton />
    </AppShell>
  );
}

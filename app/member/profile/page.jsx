import { AppShell } from "@/components/app-shell/AppShell";
import { ProfileCard } from "@/components/app-shell/ProfileCard";
import { MemberLogoutButton } from "@/components/app-shell/MemberLogoutButton";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import { getCurrentMemberFromServerCookies, getMemberProfilePhotoUrl } from "@/lib/member-auth";
import { IconCamera, IconEdit, IconLockPassword, IconUsersGroup } from "@tabler/icons-react";

export default async function ProfilePage() {
  const current = await getCurrentMemberFromServerCookies();
  const member = current?.member;
  const user = current?.user;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user);

  return (
    <AppShell navKey="more" title="Profile" subtitle="Your member details, photo, and account tools." showProfileShortcut={false}>
      <ProfileCard
        name={member?.full_name || current?.session?.fullName || "Liberty Church Member"}
        email={member?.email || current?.session?.email || "member@golibertychurch.com"}
        photoUrl={profilePhotoUrl}
        editPhotoHref="/member/profile/photo"
        footer={
          <div className="lc-profile-summary-grid">
            <div className="lc-info-item">
              <strong>Username</strong>
              <span>@{member?.username || current?.session?.username || "member"}</span>
            </div>
            <div className="lc-info-item">
              <strong>Phone</strong>
              <span>{member?.phone || "Not added yet"}</span>
            </div>
          </div>
        }
      />

      <section className="lc-stack">
        <SettingsRow icon={IconCamera} label="Profile Photo" description="Choose, crop, and save your portrait." href="/member/profile/photo" />
        <SettingsRow icon={IconEdit} label="Edit Profile" description="Update your name and phone number." href="/member/profile/edit" />
        <SettingsRow icon={IconUsersGroup} label="Church Directory" description="Open the read-only directory view." href="/member/directory" />
        <SettingsRow icon={IconLockPassword} label="Change Password" description="Open the password update screen." href="/member/profile/change-password" />
      </section>

      <MemberLogoutButton />
    </AppShell>
  );
}

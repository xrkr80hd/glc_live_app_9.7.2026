import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberProfileForm } from "@/components/app-shell/MemberProfileForm";
import { ProfileCard } from "@/components/app-shell/ProfileCard";
import { getCurrentMemberFromServerCookies, getMemberProfilePhotoUrl } from "@/lib/member-auth";

export default async function EditProfilePage() {
  const current = await getCurrentMemberFromServerCookies();
  const member = current?.member;
  const profilePhotoUrl = getMemberProfilePhotoUrl(current?.user);
  const memberProfile = {
    fullName: member?.full_name || current?.session?.fullName || "",
    email: member?.email || current?.session?.email || "",
    phone: member?.phone || "",
    username: member?.username || current?.session?.username || "",
  };

  return (
    <AppShell navKey="more" title="Edit Profile" subtitle="Keep your basic member details current." showProfileShortcut={false}>
      <BackRow fallbackHref="/member/profile" useHistory={false} />

      <ProfileCard
        name={memberProfile.fullName || "Liberty Church Member"}
        email={memberProfile.email || "member@golibertychurch.com"}
        photoUrl={profilePhotoUrl}
        uploadLabel={`@${memberProfile.username}`}
        editPhotoHref="/member/profile/photo"
      />

      <MemberProfileForm member={memberProfile} />
    </AppShell>
  );
}

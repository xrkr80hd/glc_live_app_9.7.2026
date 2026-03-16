import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberPhotoEditor } from "@/components/app-shell/MemberPhotoEditor";
import { getCurrentMemberFromServerCookies, getMemberProfilePhotoUrl } from "@/lib/member-auth";

export default async function ProfilePhotoPage() {
  const current = await getCurrentMemberFromServerCookies();
  const member = current?.member;
  const profilePhotoUrl = getMemberProfilePhotoUrl(current?.user);

  return (
    <AppShell navKey="more" title="Profile Photo" subtitle="Choose, crop, and save the portrait shown on your member profile." showProfileShortcut={false}>
      <BackRow fallbackHref="/member/profile" useHistory={false} />
      <MemberPhotoEditor
        currentPhotoUrl={profilePhotoUrl}
        memberName={member?.full_name || current?.session?.fullName || "Liberty Church Member"}
      />
    </AppShell>
  );
}

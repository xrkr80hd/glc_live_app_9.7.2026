import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberChangeEmailForm } from "@/components/app-shell/MemberChangeEmailForm";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";

export default async function ChangeEmailPage() {
  const current = await getCurrentMemberFromServerCookies();
  const member = current?.member;
  const user = current?.user;
  const currentEmail = member?.email || user?.email || "";

  return (
    <AppShell navKey="more" title="Change Email" subtitle="Update the email you use to sign in." showProfileShortcut={false}>
      <BackRow fallbackHref="/member/profile" useHistory={false} />
      <MemberChangeEmailForm currentEmail={currentEmail} />
    </AppShell>
  );
}

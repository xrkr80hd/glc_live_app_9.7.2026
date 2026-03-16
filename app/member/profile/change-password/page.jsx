import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberPasswordForm } from "@/components/app-shell/MemberPasswordForm";

export default function ChangePasswordPage() {
  return (
    <AppShell navKey="more" title="Change Password" subtitle="Update the password you use to sign in." showProfileShortcut={false}>
      <BackRow fallbackHref="/member/profile" useHistory={false} />
      <MemberPasswordForm />
    </AppShell>
  );
}

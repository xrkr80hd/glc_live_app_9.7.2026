import { AppShell } from "@/components/app-shell/AppShell";
import { AddToHomeScreenCard } from "@/components/app-shell/AddToHomeScreenCard";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import {
  IconBug,
  IconBellRinging,
  IconBible,
  IconHeartDollar,
  IconSettings,
  IconSparkles,
  IconUserCircle,
} from "@tabler/icons-react";

export default function MorePage() {
  return (
    <AppShell navKey="more" title="More" subtitle="Secondary routes and member tools.">
      <AddToHomeScreenCard />

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Your Member Tools</h2>
          <p className="lc-muted">Everything here is grouped to make the beta build easy to navigate.</p>
        </div>
      </section>

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Account</h2>
          <p className="lc-muted">Keep your member details and preferences up to date.</p>
        </div>
        <SettingsRow icon={IconUserCircle} label="Profile" description="Open your member identity hub." href="/member/profile" />
        <SettingsRow icon={IconSettings} label="Settings" description="Church preferences, privacy, and app controls." href="/member/settings" />
        <SettingsRow
          icon={IconBellRinging}
          label="Announcement Notifications"
          description="Adjust the announcement notification controls."
          href="/member/settings/announcement-notifications"
        />
      </section>

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>Church Life</h2>
          <p className="lc-muted">Open the church-wide resources members use the most.</p>
        </div>
        <SettingsRow icon={IconHeartDollar} label="Give" description="Open giving options for tithe, offering, and missions." href="/member/give" />
        <SettingsRow icon={IconBible} label="Beliefs" description="Read the current Liberty Church beliefs summary." href="/member/beliefs" />
        <SettingsRow icon={IconSparkles} label="Youth" description="Open the youth section with its own visual theme." href="/member/youth" />
        <SettingsRow icon={IconBug} label="Beta Feedback" description="Report bugs, visual issues, or tester notes for this build." href="/member/feedback" />
      </section>
    </AppShell>
  );
}

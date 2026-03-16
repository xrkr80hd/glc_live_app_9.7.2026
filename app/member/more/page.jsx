import { AppShell } from "@/components/app-shell/AppShell";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import {
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
      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Explore</h2>
          <p className="lc-muted">Find additional church tools, profile pages, and settings here.</p>
        </div>
      </section>

      <section className="lc-stack">
        <SettingsRow icon={IconUserCircle} label="Profile" description="Open your member identity hub." href="/member/profile" />
        <SettingsRow icon={IconHeartDollar} label="Give" description="Open giving options for tithe, offering, and missions." href="/member/give" />
        <SettingsRow icon={IconBible} label="Beliefs" description="Read the current Liberty Church beliefs summary." href="/member/beliefs" />
        <SettingsRow icon={IconSparkles} label="Youth" description="Open the youth section with its own visual theme." href="/member/youth" />
        <SettingsRow
          icon={IconBellRinging}
          label="Announcement Notifications"
          description="Adjust the announcement notification controls."
          href="/member/settings/announcement-notifications"
        />
        <SettingsRow icon={IconSettings} label="Settings" description="Church preferences, privacy, and app controls." href="/member/settings" />
      </section>
    </AppShell>
  );
}

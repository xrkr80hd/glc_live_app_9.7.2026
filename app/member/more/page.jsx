import { AppShell } from "@/components/app-shell/AppShell";
import { AddToHomeScreenCard } from "@/components/app-shell/AddToHomeScreenCard";
import { MemberAccordion } from "@/components/app-shell/MemberAccordion";
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

      <MemberAccordion
        title="Your Member Tools"
        description="Open your personal account tools, settings, and notification choices."
        defaultOpen
      >
        <div className="lc-stack">
          <SettingsRow icon={IconUserCircle} label="Profile" description="Open your member profile and photo." href="/member/profile" />
          <SettingsRow icon={IconSettings} label="Settings" description="Open privacy, app, and member preferences." href="/member/settings" />
          <SettingsRow
            icon={IconBellRinging}
            label="Announcement Notifications"
            description="Choose how church announcements reach you."
            href="/member/settings/announcement-notifications"
          />
        </div>
      </MemberAccordion>

      <MemberAccordion
        title="Church Life"
        description="Open the areas members use most during the week."
      >
        <div className="lc-stack">
          <SettingsRow icon={IconHeartDollar} label="Give" description="View giving options for tithe, offering, and missions." href="/member/give" />
          <SettingsRow icon={IconBible} label="Beliefs" description="Read the same beliefs summary shown on the main site." href="/member/beliefs" />
          <SettingsRow icon={IconSparkles} label="Youth" description="Open the youth section styled to match the youth website." href="/member/youth" />
          <SettingsRow icon={IconBug} label="Beta Feedback" description="Report a bug or visual issue so we can improve the app." href="/member/feedback" />
        </div>
      </MemberAccordion>
    </AppShell>
  );
}

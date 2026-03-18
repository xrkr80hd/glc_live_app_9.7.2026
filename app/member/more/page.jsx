import { AppShell } from "@/components/app-shell/AppShell";
import { MemberAccordion } from "@/components/app-shell/MemberAccordion";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import {
    IconBible,
    IconHeartDollar,
    IconLayoutDashboard,
    IconMessageReport,
    IconPlayerPlay,
    IconSettings,
    IconUserCircle,
} from "@tabler/icons-react";

export default function MorePage() {
  return (
    <AppShell navKey="more" title="More" subtitle="Settings, church tools, and help.">
      <section className="lc-stack lc-more-accordions">
        <section className="lc-card lc-more-static-card lc-member-access-card">
          <div className="lc-section-head">
            <h2>Member Access</h2>
            <p className="lc-muted">Open member content used during the week.</p>
          </div>
          <div className="lc-stack lc-member-access-links">
            <SettingsRow icon={IconLayoutDashboard} label="My Dashboard" description="Open your role-aware dashboard." href="/dashboard" />
            <SettingsRow icon={IconPlayerPlay} label="Sermons" description="Recent messages and archives." href="/member/sermons" />
            <SettingsRow icon={IconBible} label="Beliefs" description="Read our core beliefs." href="/member/beliefs" />
            <SettingsRow icon={IconHeartDollar} label="Give" description="Open giving and submit your gift." href="/member/give" />
          </div>
        </section>
        <MemberAccordion
          title="Settings"
          description="Open your profile and app preferences."
        >
          <div className="lc-stack">
            <SettingsRow icon={IconUserCircle} label="Profile" description="Open your member profile and photo." href="/member/profile" />
            <SettingsRow icon={IconSettings} label="Settings" description="Open notification and app preferences." href="/member/settings" />
          </div>
        </MemberAccordion>

        <section className="lc-card lc-more-static-card lc-report-link-card">
          <SettingsRow
            icon={IconMessageReport}
            label="Report a Problem or Suggestion"
            description="Tell us about bugs, confusing screens, or ideas."
            href="/member/feedback"
          />
        </section>
      </section>
    </AppShell>
  );
}


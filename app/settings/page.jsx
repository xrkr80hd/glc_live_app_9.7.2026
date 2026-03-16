import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import { IconAdjustmentsHorizontal, IconBellRinging, IconDeviceMobile, IconShieldLock } from "@tabler/icons-react";

export default function SettingsPage() {
  return (
    <AppShell navKey="more" title="Settings" subtitle="Preferences and app settings hub." showProfileShortcut={false}>
      <BackRow fallbackHref="/more" />

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Church Preferences</h2>
          <p className="lc-muted">Manage notifications, privacy, and app behavior from one place.</p>
        </div>
      </section>

      <section className="lc-stack">
        <SettingsRow
          icon={IconBellRinging}
          label="Announcement Notifications"
          description="Open the dedicated announcement notification controls."
          href="/settings/announcement-notifications"
        />
        <SettingsRow
          icon={IconAdjustmentsHorizontal}
          label="Notification Preferences"
          description="Open grouped notification preferences."
          href="/settings/preferences"
        />
      </section>

      <section className="lc-grid">
        <article className="lc-card">
          <div className="lc-announcement-meta">
            <IconShieldLock size={16} stroke={1.8} />
            <span>Privacy</span>
          </div>
          <p className="lc-muted">Privacy controls and policy-related cards stay visible on the hub screen.</p>
        </article>
        <article className="lc-card">
          <div className="lc-announcement-meta">
            <IconDeviceMobile size={16} stroke={1.8} />
            <span>App</span>
          </div>
          <p className="lc-muted">App-level settings remain grouped with the church preference hub.</p>
        </article>
      </section>
    </AppShell>
  );
}

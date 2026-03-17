import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberAccordion } from "@/components/app-shell/MemberAccordion";
import { ThemeModeToggleRow } from "@/components/app-shell/ThemeModeToggleRow";
import { ToggleRow } from "@/components/app-shell/ToggleRow";
import { announcementNotificationOptions, notificationPreferenceGroups } from "@/lib/mobile-app-content";
import { IconDeviceMobile, IconShieldLock } from "@tabler/icons-react";

export default function SettingsPage() {
  return (
    <AppShell navKey="more" title="Settings" subtitle="Manage app preferences." showProfileShortcut={false}>
      <BackRow fallbackHref="/member/more" />

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h2>Church Preferences</h2>
          <p className="lc-muted">Manage notifications, privacy, and app behavior from one place.</p>
        </div>
      </section>

      <section className="lc-stack lc-more-accordions">
        <MemberAccordion title="Settings" description="Notifications and appearance controls in one place." defaultOpen>
          <div className="lc-settings-merged-stack">
            <section className="lc-settings-merged-group">
              <div className="lc-section-head">
                <h3>Announcement Notifications</h3>
              </div>
              <div className="lc-stack">
                {announcementNotificationOptions.map((option) => (
                  <ToggleRow key={option.id} label={option.label} description={option.description} defaultOn={option.defaultOn} />
                ))}
              </div>
            </section>

            <section className="lc-settings-merged-group">
              <div className="lc-section-head">
                <h3>Notification Preferences</h3>
              </div>
              <div className="lc-stack">
                {notificationPreferenceGroups.map((group) => (
                  <section key={group.id} className="lc-settings-merged-subgroup">
                    <p className="lc-settings-merged-subgroup-title">{group.title}</p>
                    <div className="lc-stack">
                      {group.rows.map((row) => (
                        <ToggleRow key={row.id} label={row.label} description={row.description} defaultOn={row.defaultOn} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>

            <section className="lc-settings-merged-group">
              <div className="lc-section-head">
                <h3>Appearance</h3>
              </div>
              <ThemeModeToggleRow />
            </section>
          </div>
        </MemberAccordion>
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

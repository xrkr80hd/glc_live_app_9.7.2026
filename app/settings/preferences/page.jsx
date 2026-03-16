import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ToggleRow } from "@/components/app-shell/ToggleRow";
import { notificationPreferenceGroups } from "@/lib/mobile-app-content";

export default function NotificationPreferencesPage() {
  return (
    <AppShell navKey="more" title="Notification Preferences" subtitle="Grouped notification preferences page." showProfileShortcut={false}>
      <BackRow fallbackHref="/settings" useHistory={false} />

      <section className="lc-stack">
        {notificationPreferenceGroups.map((group) => (
          <article key={group.id} className="lc-card">
            <div className="lc-section-head">
              <h2>{group.title}</h2>
            </div>
            <div className="lc-stack">
              {group.rows.map((row) => (
                <ToggleRow key={row.id} label={row.label} description={row.description} defaultOn={row.defaultOn} />
              ))}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

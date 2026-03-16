import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ToggleRow } from "@/components/app-shell/ToggleRow";
import { announcementNotificationOptions } from "@/lib/mobile-app-content";

export default function AnnouncementNotificationsPage() {
  return (
    <AppShell
      navKey="more"
      title="Announcement Notifications"
      subtitle="Focused controls for announcement notification delivery."
      showProfileShortcut={false}
    >
      <BackRow fallbackHref="/settings" useHistory={false} />

      <section className="lc-stack">
        {announcementNotificationOptions.map((option) => (
          <ToggleRow key={option.id} label={option.label} description={option.description} defaultOn={option.defaultOn} />
        ))}
      </section>
    </AppShell>
  );
}

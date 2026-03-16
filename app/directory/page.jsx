import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { directoryEntries } from "@/lib/mobile-app-content";
import { IconMail, IconPhone, IconUsersGroup } from "@tabler/icons-react";

export default function DirectoryPage() {
  return (
    <AppShell navKey="more" title="Church Directory" subtitle="Read-only member contact structure." showProfileShortcut={false}>
      <BackRow fallbackHref="/profile" />

      <section className="lc-card alt">
        <div className="lc-announcement-meta">
          <IconUsersGroup size={16} stroke={1.8} />
          <span>This directory is view-only from the member app.</span>
        </div>
      </section>

      <section className="lc-stack">
        {directoryEntries.map((entry) => (
          <article key={entry.id} className="lc-directory-card">
            <strong>{entry.name}</strong>
            <span className="lc-directory-meta">{entry.role}</span>
            <div className="lc-announcement-meta">
              <IconMail size={16} stroke={1.8} />
              <span>{entry.email}</span>
            </div>
            <div className="lc-announcement-meta">
              <IconPhone size={16} stroke={1.8} />
              <span>{entry.phone}</span>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

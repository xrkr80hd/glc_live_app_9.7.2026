import { AnnouncementCard } from "@/components/app-shell/AnnouncementCard";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { announcementCards } from "@/lib/mobile-app-content";

export default function AnnouncementsPage() {
  return (
    <AppShell navKey="home" title="Announcements" subtitle="Church-wide updates and event notices.">
      <BackRow fallbackHref="/member" />

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>All Announcements</h2>
          <p className="lc-muted">Browse current updates, reminders, and upcoming event notices.</p>
        </div>
        {announcementCards.map((item) => (
          <AnnouncementCard
            key={item.id}
            title={item.title}
            summary={item.summary}
            date={item.date}
            href={`/announcements/${item.id}`}
            ctaLabel="Read Detail"
          />
        ))}
      </section>
    </AppShell>
  );
}

import { AnnouncementCard } from "@/components/app-shell/AnnouncementCard";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getYouthAnnouncementsContent } from "@/lib/content";
import { formatMemberDate, summarizeText } from "@/lib/member-page-data";
import Link from "next/link";

export default async function YouthAnnouncementsPage() {
  const announcements = await getYouthAnnouncementsContent();

  return (
    <AppShell navKey="youth" theme="youth" title="Youth Announcements" subtitle="Youth-only updates, reminders, and event notices.">
      <BackRow fallbackHref="/member/youth" />

      <section className="lc-stack">
        <div className="lc-section-head">
          <h2>All Youth Announcements</h2>
          <p className="lc-muted">Browse current youth updates, reminders, and upcoming event notices.</p>
        </div>
        {announcements.length ? (
          announcements.map((item) => (
            <AnnouncementCard
              key={item.id}
              title={item.title}
              summary={summarizeText(item.body, 150)}
              date={formatMemberDate(item.startsAt || item.createdAt)}
              imageUrl={item.imageUrl || item.image_url || ""}
              imageAlt={item.imageAlt || item.image_alt || ""}
              href={`/member/youth/announcements/${item.id}`}
              ctaLabel="Read Detail"
            />
          ))
        ) : (
          <section className="lc-card alt">
            <p className="lc-muted">Youth announcements will appear here as soon as they are published.</p>
          </section>
        )}
        <Link href="/member/youth" className="lc-link-inline">Back to Youth</Link>
      </section>
    </AppShell>
  );
}

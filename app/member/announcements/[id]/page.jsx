import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getMemberAnnouncementById } from "@/lib/content";
import { formatMemberDate } from "@/lib/member-page-data";
import { IconCalendarWeek } from "@tabler/icons-react";

export default async function AnnouncementDetailPage({ params }) {
  const resolvedParams = await params;
  const announcement = await getMemberAnnouncementById(resolvedParams?.id);

  return (
    <AppShell navKey="home" title="Announcement Detail" subtitle="Full announcement reading page.">
      <BackRow fallbackHref="/member" useHistory={false} />

      {announcement ? (
        <>
          <section className="lc-card">
            <div className="lc-announcement-meta">
              <IconCalendarWeek size={16} stroke={1.8} />
              <span>{formatMemberDate(announcement.startsAt || announcement.createdAt)}</span>
            </div>
            <div className="lc-stack">
              <h2>{announcement.title}</h2>
              <div className="lc-rich-copy">
                <p>{announcement.body}</p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="lc-card alt">
          <p className="lc-muted">That announcement is no longer available.</p>
        </section>
      )}
    </AppShell>
  );
}

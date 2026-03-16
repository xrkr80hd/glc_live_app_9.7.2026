import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { findAnnouncementById } from "@/lib/mobile-app-content";
import { IconCalendarWeek, IconNotes, IconTargetArrow } from "@tabler/icons-react";

function getAnnouncementHref(announcementId) {
  if (announcementId === "announcement-1") {
    return "/member/prayer";
  }
  if (announcementId === "announcement-2") {
    return "/member/youth";
  }
  return "/member/feedback";
}

export default async function AnnouncementDetailPage({ params }) {
  const resolvedParams = await params;
  const announcement = findAnnouncementById(resolvedParams?.id);

  return (
    <AppShell navKey="home" title="Announcement Detail" subtitle="Full announcement reading page.">
      <BackRow fallbackHref="/member/announcements" useHistory={false} />

      <section className="lc-card">
        <div className="lc-announcement-meta">
          <IconCalendarWeek size={16} stroke={1.8} />
          <span>{announcement.date}</span>
        </div>
        <div className="lc-stack">
          <h2>{announcement.title}</h2>
          <div className="lc-rich-copy">
            <p>{announcement.summary}</p>
            <p>{announcement.content}</p>
          </div>
        </div>
      </section>

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h3>Next Step</h3>
          <p className="lc-muted">Use the follow-up action that best fits this update.</p>
        </div>
        <div className="lc-card-list">
          <span className="lc-tag">
            <IconNotes size={14} stroke={1.8} />
            Details
          </span>
          <span className="lc-tag">
            <IconTargetArrow size={14} stroke={1.8} />
            Follow up
          </span>
        </div>
        <ButtonRow
          actions={[
            {
              label: announcement.ctaLabel || "Done",
              href: getAnnouncementHref(announcement.id),
              variant: "ghost",
            },
          ]}
        />
      </section>
    </AppShell>
  );
}

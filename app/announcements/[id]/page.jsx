import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { ButtonRow } from "@/components/app-shell/ButtonRow";
import { IconCalendarWeek, IconNotes, IconTargetArrow } from "@tabler/icons-react";

export default function AnnouncementDetailPage() {
  return (
    <AppShell navKey="home" title="Announcement Detail" subtitle="Full announcement reading page.">
      <BackRow fallbackHref="/announcements" useHistory={false} />

      <section className="lc-card">
        <div className="lc-announcement-meta">
          <IconCalendarWeek size={16} stroke={1.8} />
          <span>[ANNOUNCEMENT_DATE]</span>
        </div>
        <div className="lc-stack">
          <h2>[ANNOUNCEMENT_TITLE]</h2>
          <div className="lc-rich-copy">
            <p>[ANNOUNCEMENT_SUMMARY]</p>
            <p>[ANNOUNCEMENT_FULL_CONTENT]</p>
          </div>
        </div>
      </section>

      <section className="lc-card alt">
        <div className="lc-section-head">
          <h3>Next Step</h3>
          <p className="lc-muted">If an announcement needs a call to action, it can appear here.</p>
        </div>
        <div className="lc-card-list">
          <span className="lc-tag">
            <IconNotes size={14} stroke={1.8} />
            Details
          </span>
          <span className="lc-tag">
            <IconTargetArrow size={14} stroke={1.8} />
            Optional action
          </span>
        </div>
        <ButtonRow
          actions={[
            {
              label: "[ANNOUNCEMENT_CTA_LABEL]",
              disabled: true,
              variant: "ghost",
            },
          ]}
        />
      </section>
    </AppShell>
  );
}

import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getMemberAnnouncementById } from "@/lib/content";
import { formatMemberDate } from "@/lib/member-page-data";
import { IconCalendarWeek } from "@tabler/icons-react";

export default async function AnnouncementDetailPage({ params }) {
  const resolvedParams = await params;
  const announcement = await getMemberAnnouncementById(resolvedParams?.id);
  const imageUrl = String(announcement?.imageUrl || announcement?.image_url || "").trim();
  const imageAlt =
    String(announcement?.imageAlt || announcement?.image_alt || "").trim() ||
    (announcement?.title ? `${announcement.title} announcement image` : "Announcement image");

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
                {imageUrl ? (
                  <div
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid rgba(140, 152, 164, 0.24)",
                      marginBottom: "0.8rem",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      loading="lazy"
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : null}
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

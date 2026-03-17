import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getYouthEventAlbumById } from "@/lib/content";
import { formatMemberDate, summarizeText } from "@/lib/member-page-data";
import { IconCalendarEvent } from "@tabler/icons-react";

export default async function YouthEventAlbumPage({ params }) {
  const resolvedParams = await params;
  const albumBundle = await getYouthEventAlbumById(resolvedParams?.id);
  const album = albumBundle?.album || null;
  const photos = (albumBundle?.photos || []).filter((item) => item.photoUrl);
  const videos = albumBundle?.videos || [];

  return (
    <AppShell
      navKey="youth"
      theme="youth"
      title={album?.title || "Event Album"}
      subtitle="Photos and videos from this event."
    >
      <BackRow fallbackHref="/member/youth/event" useHistory={false} />

      {album ? (
        <>
          <section className="lc-card alt">
            <div className="lc-section-head">
              <h2>{album.title}</h2>
            </div>
            <div className="lc-announcement-meta">
              <IconCalendarEvent size={16} stroke={1.8} />
              <span>{formatMemberDate(album.albumDate || album.createdAt, "Date coming soon")}</span>
            </div>
            {album.description ? <p className="lc-muted">{album.description}</p> : null}
          </section>

          <section className="lc-card alt">
            <div className="lc-section-head">
              <h2>Photos</h2>
            </div>
            {photos.length ? (
              <div className="lc-youth-event-photo-grid">
                {photos.map((photo) => (
                  <figure key={photo.id} className="lc-youth-event-photo">
                    <img src={photo.photoUrl} alt={photo.caption || `${album.title} photo`} loading="lazy" />
                    <figcaption>
                      {photo.caption || "Event photo"}
                      <span>{formatMemberDate(photo.takenOn || photo.createdAt, "Date unavailable")}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="lc-muted">No photos have been published for this event yet.</p>
            )}
          </section>

          <section className="lc-card alt">
            <div className="lc-section-head">
              <h2>Videos</h2>
            </div>
            {videos.length ? (
              <div className="lc-stack">
                {videos.map((video) => (
                  <article key={video.id} className="lc-youth-event-video-card">
                    <div className="lc-youth-event-video-frame">
                      {video.embedUrl ? (
                        <iframe
                          src={video.embedUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          title={video.title}
                        />
                      ) : video.isDirectVideo ? (
                        <video controls preload="metadata" poster={video.thumbnailUrl || undefined}>
                          <source src={video.videoUrl} />
                        </video>
                      ) : video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={`${video.title} thumbnail`} loading="lazy" />
                      ) : (
                        <div className="lc-empty-state">
                          <strong>Video unavailable</strong>
                        </div>
                      )}
                    </div>
                    <div className="lc-stack">
                      <h3>{video.title}</h3>
                      <p className="lc-muted">{summarizeText(video.description || "Youth event video.", 96)}</p>
                      <div className="lc-announcement-meta">
                        <IconCalendarEvent size={16} stroke={1.8} />
                        <span>{formatMemberDate(video.recordedOn || video.createdAt, "Date unavailable")}</span>
                      </div>
                      {video.watchUrl ? (
                        <Link href={video.watchUrl} target="_blank" rel="noreferrer" className="lc-action-link secondary">
                          Open Video
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="lc-muted">No videos have been published for this event yet.</p>
            )}
          </section>
        </>
      ) : (
        <section className="lc-card alt">
          <p className="lc-muted">That event album is no longer available.</p>
        </section>
      )}
    </AppShell>
  );
}

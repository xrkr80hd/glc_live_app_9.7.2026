import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getYouthEventAlbums } from "@/lib/content";
import { formatMemberDate } from "@/lib/member-page-data";

export default async function YouthEventPage() {
  const albums = await getYouthEventAlbums();

  return (
    <AppShell navKey="youth" theme="youth" title="Past Events" subtitle="Open an album to view media.">
      <BackRow fallbackHref="/member/youth" useHistory={false} />

      <section className="lc-stack">
        {albums.length ? (
          <section className="lc-card alt lc-youth-album-rail-wrap">
            <div className="lc-section-head">
              <h2>Albums</h2>
            </div>
            <div className="lc-youth-album-rail" aria-label="Past event albums">
              {albums.map((album) => (
                <Link key={album.id} href={`/member/youth/event/${album.id}`} className="lc-announcement-card lc-youth-event-album-row">
                  <div className="lc-youth-event-album-cover">
                    {album.coverPhotoUrl ? (
                      <img src={album.coverPhotoUrl} alt={`${album.title} cover`} loading="lazy" />
                    ) : (
                      <span>Event</span>
                    )}
                  </div>
                  <div className="lc-youth-event-album-copy">
                    <h3>{album.title}</h3>
                    <p className="lc-muted lc-youth-event-album-date">
                      {formatMemberDate(album.albumDate || album.createdAt, "Date coming soon")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="lc-card alt">
            <p className="lc-muted">No youth event albums have been published yet.</p>
          </section>
        )}
      </section>
    </AppShell>
  );
}

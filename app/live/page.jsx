import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { getLivestreamContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const livestream = await getLivestreamContent();
  const fallbackVideo =
    livestream.fallbackVideoUrl && !livestream.fallbackVideoUrl.includes("stream_fallback_loop")
      ? livestream.fallbackVideoUrl
      : "https://www.golibertychurch.com/assets/hero_vids/worship_hero.mp4";

  return (
    <>
      <ChurchHeader active="live" />

      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h1>Live Stream</h1>
              <p className="muted">Join us Sundays at 10:00 AM.</p>
            </div>

            <div id="LS1" style={{ display: livestream.isLive ? "block" : "none" }}>
              <div className="embed aspect-16x9">
                {livestream.isLive && livestream.liveEmbedUrl ? (
                  <iframe
                    src={livestream.liveEmbedUrl}
                    title={livestream.title || "Live Stream"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : null}
              </div>
            </div>

            <div id="LS2" style={{ display: livestream.isLive ? "none" : "block" }}>
              <div className="embed aspect-16x9">
                <video className="fallback-video" autoPlay muted loop playsInline>
                  <source src={fallbackVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="note">We are not currently streaming live. Join us Sundays at 10:00 AM.</p>
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="container">
            <h2>Can&apos;t Make It Live?</h2>
            <p className="sub">Catch up on recent sermons and services.</p>
            <div className="cta-row">
              <a className="btn" href="/sermons">
                Watch Sermons
              </a>
              <a className="btn ghost" href="/prayer">
                Submit Prayer Request
              </a>
            </div>
          </div>
        </section>
      </main>

      <ChurchSimpleFooter />
    </>
  );
}

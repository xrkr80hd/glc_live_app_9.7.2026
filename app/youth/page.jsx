import { BodyClass } from "@/components/BodyClass";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getYouthPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture, youthBanner } = await getYouthPageContent();
  const tickerTextRaw = youthBanner?.subtitle || "Sundays @ 9:20 AM - Youth Devotion | Pop-Up Events - Check back for more info";
  const tickerText = tickerTextRaw.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s{2,}/g, " ").trim();

  return (
    <>
      <BodyClass className="youth" />
      <ChurchHeader active="youth" youthBrand />

      <section className="bg-[linear-gradient(145deg,rgba(10,18,31,0.92)_0%,rgba(14,23,39,0.92)_100%)] pb-[3%]">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
          <BlurFade inView delay={0.04}>
            <Card className="relative min-h-[240px] overflow-hidden border border-[#66e49e]/32 bg-[#172034] py-0 shadow-sm sm:min-h-[290px]">
              <video className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-65 contrast-110 saturate-125" autoPlay loop muted playsInline preload="metadata" poster="/assets/youth-backdrop.png">
                <source src="https://www.golibertychurch.com/assets/LC_YOUTH_HERO_VID.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,32,52,0.58)_0%,rgba(33,49,79,0.42)_50%,rgba(23,32,52,0.58)_100%)]" aria-hidden="true" />
              <CardHeader className="relative z-10 px-5 pb-2 pt-6 sm:px-8 sm:pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b7d9ff]">We Are</p>
                <CardTitle className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">Liberty Church Youth</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-5 pb-7 pt-2 sm:px-8 sm:pb-8">
                <span className="inline-block h-6 w-full" aria-hidden="true" />
              </CardContent>
            </Card>
          </BlurFade>
        </div>
      </section>

      <section className="youth-ticker" aria-live="polite">
        <div className="ticker-track">
          <div className="ticker-item">{tickerText}</div>
          <div className="ticker-item" aria-hidden="true">
            {tickerText}
          </div>
        </div>
      </section>

      <section className="section alt youth-scripture" id="week-in-word">
        <div className="container">
          <div className="section-head">
            <h2>Scripture of the Week</h2>
          </div>
          <article className="glass-card youth-scripture-single">
            <h3>Scripture</h3>
            <p id="scripture-reference" className="youth-scripture-reference">
              {youthScripture.reference}
            </p>
            <blockquote className="youth-scripture-verse">
              <p id="scripture-text">{youthScripture.verse_text}</p>
            </blockquote>
            <h3>Lean In and Reflect</h3>
            <p id="devotional-text">{youthBanner?.title || "Take this verse with you this week and ask God how to live it out today."}</p>
          </article>
        </div>
      </section>

      <section className="section alt youth-announcements" id="announcements">
        <div className="container">
          <div className="section-head">
            <h2>Announcements and Events</h2>
            <p className="sub">Fresh updates, pop-up hangs, and everything happening next.</p>
          </div>
          <div className="announcements-grid" id="announcements-grid">
            {youthAnnouncements.length ? (
              youthAnnouncements.map((item) => (
                <article key={item.id} className="announcement-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))
            ) : (
              <article className="announcement-card empty" id="announcements-empty">
                <p className="muted">Announcements are loading...</p>
              </article>
            )}
          </div>
        </div>
      </section>

      <ChurchSimpleFooter />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .youth-ticker {
              background: linear-gradient(90deg, #172034 0%, #21314f 50%, #172034 100%);
              border-top: 1px solid rgba(102, 228, 158, 0.35);
              border-bottom: 1px solid rgba(102, 228, 158, 0.35);
              padding: 0.95rem 0;
              overflow: hidden;
              position: relative;
              box-shadow: 0 12px 32px rgba(2, 8, 22, 0.4);
            }

            .ticker-track {
              display: flex;
              min-width: max-content;
              animation: tickerScroll 28s linear infinite;
            }

            .ticker-track:hover {
              animation-play-state: paused;
            }

            .ticker-item {
              color: #fff;
              font-size: 1.1rem;
              font-weight: 600;
              white-space: nowrap;
              padding: 0 2.5rem;
              display: flex;
              align-items: center;
              letter-spacing: 0.04em;
            }

            .youth-scripture-single {
              display: grid;
              gap: 0.85rem;
            }

            .youth-scripture-single h3 {
              margin: 0;
              font-size: 0.96rem;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }

            .youth-scripture-reference {
              margin: 0;
              font-weight: 700;
            }

            .youth-scripture-verse {
              margin: 0;
              padding-left: 0.9rem;
              border-left: 3px solid rgba(102, 228, 158, 0.55);
            }

            .youth-scripture-verse p {
              margin: 0;
            }

            @keyframes tickerScroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            @media (max-width: 768px) {
              .youth-ticker {
                padding: 0.8rem 0;
              }

              .ticker-item {
                font-size: 0.95rem;
                padding: 0 1.5rem;
              }
            }
          `,
        }}
      />
    </>
  );
}

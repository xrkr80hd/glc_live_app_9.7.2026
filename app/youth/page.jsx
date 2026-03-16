import { BodyClass } from "@/components/BodyClass";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { getYouthPageContent } from "@/lib/content";
import { IconBible, IconCalendarEvent, IconVideo } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture, youthBanner } = await getYouthPageContent();
  const tickerTextRaw = youthBanner?.subtitle || "Sundays @ 9:20 AM — Youth Devotion | Pop-Up Events — Check back for more info";
  const tickerText = tickerTextRaw.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s{2,}/g, " ").trim();

  return (
    <>
      <BodyClass className="youth" />
      <ChurchHeader active="youth" youthBrand />

      <section className="hero youth-hero">
        <video id="heroVideo" autoPlay muted loop playsInline preload="metadata" poster="/assets/youth-backdrop.png">
          <source src="https://www.golibertychurch.com/assets/LC_YOUTH_HERO_VID.mp4" type="video/mp4" />
        </video>
        <div className="overlay" />
        <div className="content container">
          <span className="hero-subtitle">WE ARE LC YOUTH</span>
          <h1 className="hero-title">LC Youth</h1>
          <p className="hero-tagline">Rooted in Jesus. Fueled by community.</p>
          <p className="hero-description">Middle and high school students discovering identity, purpose, and friendships that last forever.</p>
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
            <span className="eyebrow">Here&apos;s what&apos;s speaking to us</span>
            <h2>
              <span className="heading-inline">
                <IconBible size={28} stroke={1.8} aria-hidden="true" />
                <span>Scripture of the Week + Devotional</span>
              </span>
            </h2>
            <p className="sub">Each week we rally around a verse and a short devo crafted by our youth team.</p>
          </div>
          <div className="youth-scripture-grid">
            <article className="glass-card scripture-card">
              <span className="badge badge-light">Scripture of the Week</span>
              <blockquote>
                <p id="scripture-text">{youthScripture.verse_text}</p>
              </blockquote>
              <cite id="scripture-reference">{youthScripture.reference}</cite>
            </article>
            <article className="glass-card devotional-card">
              <div className="devotional-header">
                <span className="badge badge-outline">Weekly Devo</span>
                <h3>Lean in &amp; reflect</h3>
              </div>
              <div id="devotional-text" className="devotional-text">
                <p>{youthBanner?.title || "Hang tight—our next devotional drops right after service!"}</p>
              </div>
              <div className="devotional-footer">
                <p>
                  Want to talk it out? Show up Sundays at <strong>9:20 AM</strong> for student-led conversation and prayer.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section alt youth-announcements" id="announcements">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Don&apos;t miss out</span>
            <h2>
              <span className="heading-inline">
                <IconCalendarEvent size={28} stroke={1.8} aria-hidden="true" />
                <span>Announcements &amp; Events</span>
              </span>
            </h2>
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

      <section className="section youth-gallery" id="gallery">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Memories in motion</span>
            <h2>
              <span className="heading-inline">
                <IconVideo size={28} stroke={1.8} aria-hidden="true" />
                <span>Check out our past hangouts</span>
              </span>
            </h2>
            <p className="sub">Choose an album to explore highlight photos and videos.</p>
          </div>
          <div className="gallery-controls">
            <label className="sr-only" htmlFor="youth-album-select">
              Choose an album
            </label>
            <select id="youth-album-select" className="album-select" disabled defaultValue="">
              <option value="">Albums coming soon</option>
            </select>
          </div>
          <div className="gallery-stage empty" id="gallery-stage">
            <div className="stage-placeholder">
              <p className="muted">Gallery coming soon. Check back after our next youth hangout!</p>
            </div>
          </div>
          <div className="media-grid" id="gallery-media-grid" aria-live="polite" />
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

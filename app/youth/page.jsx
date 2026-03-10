import { BodyClass } from "@/components/BodyClass";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSimpleFooter } from "@/components/ChurchSimpleFooter";
import { getYouthPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function YouthPage() {
  const { youthAnnouncements, youthScripture, youthBanner } = await getYouthPageContent();
  const tickerText = youthBanner?.subtitle || "Sundays @ 9:20 AM — Youth Devotion | Pop-Up Events — Check back for more info";

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
            <h2>Scripture of the Week + Devotional</h2>
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
            <h2>Announcements &amp; Events</h2>
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
            <h2>Check out our past hangouts</h2>
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
              background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
              background-size: 200% 100%;
              animation: gradientShift 8s ease infinite;
              padding: 1.2rem 0;
              overflow: hidden;
              position: relative;
              box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            }

            .youth-ticker::before,
            .youth-ticker::after {
              content: "";
              position: absolute;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
              animation: shimmer 2s ease-in-out infinite;
            }

            .youth-ticker::before {
              top: 0;
            }

            .youth-ticker::after {
              bottom: 0;
              animation-direction: reverse;
            }

            .ticker-track {
              display: flex;
              animation: tickerScroll 25s linear infinite;
              will-change: transform;
            }

            .ticker-track:hover {
              animation-play-state: paused;
            }

            .ticker-item {
              color: #fff;
              font-size: 1.1rem;
              font-weight: 600;
              white-space: nowrap;
              padding: 0 4rem;
              display: flex;
              align-items: center;
              text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              letter-spacing: 0.5px;
              animation: textGlow 3s ease-in-out infinite;
            }

            .ticker-item::before,
            .ticker-item::after {
              content: "⚡";
              font-size: 1.3rem;
              animation: pulse 1.5s ease-in-out infinite;
            }

            .ticker-item::before {
              margin-right: 1rem;
            }

            .ticker-item::after {
              margin-left: 1rem;
              animation-delay: 0.75s;
            }

            @keyframes gradientShift {
              0%,
              100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }

            @keyframes shimmer {
              0%,
              100% {
                transform: translateX(-100%);
                opacity: 0;
              }
              50% {
                opacity: 1;
              }
              100% {
                transform: translateX(100%);
              }
            }

            @keyframes tickerScroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            @keyframes textGlow {
              0%,
              100% {
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2);
              }
              50% {
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 255, 0.4);
              }
            }

            @media (max-width: 768px) {
              .ticker-item {
                font-size: 0.95rem;
                padding: 0 2rem;
              }
            }
          `,
        }}
      />
    </>
  );
}

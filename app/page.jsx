import Link from "next/link";
import { HomeRuntime } from "@/components/HomeRuntime";
import { getHomepageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { announcements, scripture, livestream } = await getHomepageContent();

  return (
    <>
      <HomeRuntime />

      <section className="hero section">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="https://www.golibertychurch.com/assets/hero.jpg"
          id="heroVideo"
          className="spawn"
        />
        <div className="overlay" />
        <div className="content container">
          <div className="kicker">Welcome Home</div>
          <h1 className="h1">
            Jesus-centered. Spirit-led.
            <br />
            Family-minded.
          </h1>
          <p className="sub">
            Sundays @ 9:20 AM - Youth Devotion
            <br />
            Sundays @ 10:00 AM - Worship Service
          </p>
          <div className="cta-row">
            <Link className="btn" href="/visit">
              Plan Your Visit
            </Link>
            <Link className="btn ghost" href="/sermons">
              Watch Sermons
            </Link>
          </div>
          <div className="mt-12">
            <button id="reopenWelcome" className="btn ghost" type="button">
              A welcome message from Pastor Andrew Stokes
            </button>
          </div>
        </div>
      </section>

      <section className="section announcements">
        <div className="container">
          <h2>Announcements &amp; Events</h2>
          <p className="sub">Stay updated with the latest news and upcoming events.</p>
          <div className="announcements-container">
            <article className="ann-item scripture-highlight">
              <h3>Scripture of the Week</h3>
              <blockquote>{scripture.verse_text}</blockquote>
              <p className="scripture-ref">{scripture.reference}</p>
            </article>
            {announcements.map((item) => (
              <article key={item.id} className="ann-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cards">
          <article className="card">
            <h2>Current Livestream</h2>
            <p>{livestream.isLive ? livestream.title : livestream.note}</p>
            <Link href="/live" className="btn">
              {livestream.isLive ? "Join Live Stream" : "Open Live Page"}
            </Link>
          </article>
          <article className="card">
            <h2>Need Prayer?</h2>
            <p>Share your request with our prayer team. We are praying with you.</p>
            <Link href="/prayer" className="btn ghost">
              Submit Prayer Request
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}

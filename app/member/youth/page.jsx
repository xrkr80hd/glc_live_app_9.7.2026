import Link from "next/link";
import { BodyClass } from "@/components/BodyClass";
import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { getYouthPageContent } from "@/lib/content";
import { IconBook2, IconCalendarEvent, IconMapPin } from "@tabler/icons-react";

export default async function YouthPage() {
  const { youthAnnouncements, youthBanner } = await getYouthPageContent();

  return (
    <AppShell navKey="more" theme="youth" title="Youth" subtitle="Youth devotional, updates, and event details.">
      <BodyClass className="youth" />
      <BackRow fallbackHref="/member/more" />

      <section className="lc-youth-shell-hero">
        <video autoPlay muted loop playsInline preload="metadata" poster="/assets/youth-backdrop.png">
          <source src="https://www.golibertychurch.com/assets/LC_YOUTH_HERO_VID.mp4" type="video/mp4" />
        </video>
        <div className="overlay" />
        <div className="content">
          <span className="hero-subtitle">WE ARE LC YOUTH</span>
          <h2 className="hero-title">LC Youth</h2>
          <p className="hero-tagline">Rooted in Jesus. Fueled by community.</p>
          <p className="hero-description">{youthBanner?.subtitle || "Student devotionals, youth events, and updates in one place."}</p>
        </div>
      </section>

      <section className="section alt lc-youth-embedded-section">
        <div className="section-head">
          <span className="eyebrow">Youth devotional</span>
          <h2>Weekly Devotional</h2>
          <p className="sub">This page is devotional-focused only, matching the youth direction.</p>
        </div>
        <article className="glass-card devotional-card">
          <div className="devotional-header">
            <span className="badge badge-outline">Weekly Devo</span>
            <h3>{youthBanner?.title || "Open this week's youth devotional"}</h3>
          </div>
          <div className="devotional-text">
            <p>Tap the devotional to read this week's focus and reflection notes.</p>
          </div>
          <div className="lc-button-row">
            <Link href="/member/youth/devotional" className="lc-action-link primary">
              <IconBook2 size={18} stroke={1.8} />
              <span>Open Devotional</span>
            </Link>
            <Link href="/member/youth/event" className="lc-action-link ghost">
              <IconCalendarEvent size={18} stroke={1.8} />
              <span>View Event</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="section alt lc-youth-embedded-section">
        <div className="section-head">
          <h2>Announcements and Events</h2>
          <p className="sub">Fresh youth updates pulled from the same content stream used by the youth website.</p>
        </div>
        <div className="announcements-grid">
          {youthAnnouncements.length ? (
            youthAnnouncements.map((item) => (
              <article key={item.id} className="announcement-card">
                <h3>{item.title}</h3>
                <p className="announcement-copy">{item.body}</p>
              </article>
            ))
          ) : (
            <article className="announcement-card empty">
              <p className="muted">Announcements are loading...</p>
            </article>
          )}
        </div>
      </section>

      <section className="section lc-youth-embedded-section">
        <div className="section-head">
          <h2>Gather With Us</h2>
          <p className="sub">A simple reminder for students and families opening the youth tab.</p>
        </div>
        <article className="schedule-card">
          <div className="lc-announcement-meta">
            <IconMapPin size={16} stroke={1.8} />
            <span>Liberty Church Youth Space</span>
          </div>
          <h3>Youth Devotion</h3>
          <p>Sundays at 9:20 AM. Come early, bring a friend, and jump in.</p>
        </article>
      </section>
    </AppShell>
  );
}

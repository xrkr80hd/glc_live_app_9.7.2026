import Script from "next/script";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSiteFooter } from "@/components/ChurchSiteFooter";
import { HighlightShowcaseCard } from "@/components/HighlightShowcaseCard";
import { getHomepageContent } from "@/lib/content";
import {
  IconCalendarEvent,
  IconCompass,
  IconInfoCircle,
  IconMapPin,
  IconMessageCircleHeart,
  IconPlayerPlay,
  IconSend,
  IconUsersGroup,
} from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { announcements, ministries, highlightCards } = await getHomepageContent();

  return (
    <>
      <ChurchHeader active="home" />

      <section className="hero">
        <video autoPlay muted loop playsInline preload="metadata" poster="/assets/youth-backdrop.png" id="heroVideo" className="spawn" />
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
            10:00 AM - Worship Service • 100 McKeithen Dr, Alexandria, LA
          </p>
          <div className="cta-row">
            <a className="btn" href="#visit">
              <IconCalendarEvent size={18} stroke={1.9} aria-hidden="true" />
              Plan Your Visit
            </a>
            <a className="btn ghost" href="/sermons">
              <IconPlayerPlay size={18} stroke={1.9} aria-hidden="true" />
              Watch Sermons
            </a>
          </div>
          <div className="mt-12">
            <button id="reopenWelcome" className="btn ghost" type="button">
              <IconMessageCircleHeart size={18} stroke={1.9} aria-hidden="true" />
              A welcome message from Pastor Andrew Stokes
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <HighlightShowcaseCard cards={highlightCards} />
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Our Ministries</h2>
          <p className="sub">Ministry highlights and opportunities to get connected.</p>
          <div className="ann-list" id="ministries">
            {ministries.map((item) => (
              <div key={item.id} className="ann-item">
                <strong>{item.title}</strong> — {item.body}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pastor-wrap">
            <div className="pastor-text">
              <h2>
                <span className="heading-inline">
                  <IconUsersGroup size={32} stroke={1.8} aria-hidden="true" />
                  <span>Meet Our Pastor</span>
                </span>
              </h2>
              <p>
                Pastor Andrew Stokes has led our church family since October 2013. He and his wife, Erin—our worship leader—serve side by side with their daughters,
                Ellington and Emery, who are active in media and worship. Though both Andrew and Erin are bi-vocational, their hearts are fully committed to the church
                God has entrusted to their care. They long for Liberty Church to be a place where everyone can approach the throne of God freely and give Him the praise
                He deserves. Pastor Andrew teaches the Word with the guidance of the Holy Spirit, encouraging every person—member and guest alike—to pursue Christ
                wholeheartedly, just as He passionately pursues us.
              </p>
            </div>
            <div className="pastor-media">
              <figure className="pastor-card raw" aria-hidden="true">
                <img
                  className="pastor-photo"
                  src="https://www.golibertychurch.com/assets/Pastor%26Fam.jpg"
                  alt="Pastor Andrew Stokes and family"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Service Times</h2>
          <p className="sub">Join us each week.</p>
          <div className="ann-list">
            <div className="ann-item">
              <strong>Sunday</strong> — 9:20 AM (Youth Devotion)
            </div>
            <div className="ann-item">
              <strong>Sunday</strong> — 10:00 AM (Worship Service)
            </div>
            <div className="ann-item">
              <strong>Wednesday</strong> — 6:30 PM (Youth Service)
            </div>
          </div>
        </div>
      </section>

      <section className="section announcements">
        <div className="container">
          <h2>
            <span className="heading-inline">
              <IconInfoCircle size={28} stroke={1.8} aria-hidden="true" />
              <span>Announcements &amp; Events</span>
            </span>
          </h2>
          <p className="sub">Stay updated with the latest news and upcoming events at Liberty Church.</p>
          <div className="announcements-container">
            {announcements.map((item) => (
              <article key={item.id} className="ann-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="visit">
        <div className="container">
          <h2>
            <span className="heading-inline">
              <IconMapPin size={28} stroke={1.8} aria-hidden="true" />
              <span>Plan Your Visit</span>
            </span>
          </h2>
          <p className="sub">We can&apos;t wait to meet you! Tell us when you&apos;re coming and we&apos;ll save you a seat and show you around.</p>
          <form className="form" id="visitForm" data-endpoint="/api/visit/">
            <div className="row">
              <div>
                <label>
                  First &amp; Last Name
                  <br />
                  <input required name="name" placeholder="Your name" />
                </label>
              </div>
              <div>
                <label>
                  Email
                  <br />
                  <input required type="email" name="email" placeholder="you@example.com" />
                </label>
              </div>
            </div>
            <div className="row">
              <div>
                <label>
                  Phone
                  <br />
                  <input name="phone" placeholder="(###) ###-####" />
                </label>
              </div>
              <div>
                <label>
                  Visit Date
                  <br />
                  <input type="date" name="date" />
                </label>
              </div>
            </div>
            <label>
              How many are coming?
              <br />
              <select name="party" defaultValue="1">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </label>
            <label>
              Anything we can prepare for?
              <br />
              <textarea name="notes" rows={4} placeholder="Kids check-in, accessibility needs, prayer requests..." />
            </label>
            <div>
              <button className="btn" type="submit">
                <IconSend size={18} stroke={1.9} aria-hidden="true" />
                Send
              </button>
            </div>
          </form>
          <div id="visitMsg" className="mt-8" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>
            <span className="heading-inline">
              <IconCompass size={28} stroke={1.8} aria-hidden="true" />
              <span>Find Us</span>
            </span>
          </h2>
          <div className="map">
            <iframe
              title="Map to Liberty Church"
              frameBorder="0"
              src="https://www.google.com/maps?q=100%20McKeithen%20Dr%2C%20Alexandria%2C%20LA%2071303&output=embed"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <ChurchSiteFooter />

      <div id="welcomeModal" className="modal" aria-hidden="true" role="dialog" aria-labelledby="welcomeTitle">
        <div className="modal-backdrop" />
        <div className="modal-dialog" role="document">
          <button className="modal-close" aria-label="Close" type="button">
            ×
          </button>
          <div className="modal-body">
            <h2 id="welcomeTitle">We&apos;re so glad you&apos;re here!</h2>
            <div id="welcomeContent" className="welcome-content mt-12" />
          </div>
        </div>
      </div>

      <Script id="home-visit-submit" strategy="afterInteractive">{`
        (function() {
          const form = document.getElementById('visitForm');
          const msg = document.getElementById('visitMsg');
          if (!form || !msg) return;
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = 'Sending...';
            const fd = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            try {
              const res = await fetch('/api/visit', { method: 'POST', body: fd });
              const json = await res.json().catch(() => ({ success: false }));
              if (res.ok && json.success) {
                msg.textContent = 'Thanks! Your visit request has been received.';
                form.reset();
              } else {
                msg.textContent = json.message || 'Unable to send. Please try again.';
              }
            } catch (err) {
              msg.textContent = 'Network error sending request.';
              console.error(err);
            } finally {
              if (submitBtn) submitBtn.disabled = false;
            }
          });
        })();
      `}</Script>
    </>
  );
}

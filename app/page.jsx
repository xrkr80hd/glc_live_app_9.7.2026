import Script from "next/script";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSiteFooter } from "@/components/ChurchSiteFooter";
import { getHomepageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { announcements, scripture } = await getHomepageContent();

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
              Plan Your Visit
            </a>
            <a className="btn ghost" href="/sermons">
              Watch Sermons
            </a>
          </div>
          <div className="mt-12">
            <button id="reopenWelcome" className="btn ghost" type="button">
              A welcome message from Pastor Andrew Stokes
            </button>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Our Ministries and Service Times</h2>
          <p className="sub">Below are our ministry highlights and service times; see announcements for updates.</p>
          <div className="ann-list" id="ministries">
            <div className="ann-item">
              <strong>Men&apos;s Fellowship</strong> — First Thursday each month, 6:00 PM. Come hang out, build friendships, dinner and fellowship.
            </div>
            <div className="ann-item">
              <strong>Children&apos;s Church</strong> — Is offered during the sermon each Sunday, except for the last Sunday of the month.
            </div>
            <div className="ann-item">
              <strong>Join a Serve Team</strong> — Media, worship, greeters, and kids teams are growing. Ask at the Info Table.
            </div>
            <div className="ann-item">
              <strong>Nursery Available!</strong> — We&apos;d love to care for your little ones! Our nursery is open during every service, offering a safe and loving place for them while you worship.
            </div>
          </div>
        </div>
      </section>

      <section className="section announcements">
        <div className="container">
          <h2>📢 Announcements &amp; Events</h2>
          <p className="sub">Stay updated with the latest news and upcoming events at Liberty Church.</p>
          <div className="announcements-container">
            <article className="ann-item">
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
        <div className="container">
          <div className="pastor-wrap">
            <div className="pastor-text">
              <h2>Meet Our Pastor</h2>
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

      <section className="section" id="visit">
        <div className="container">
          <h2>Plan Your Visit</h2>
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
                Send
              </button>
            </div>
          </form>
          <div id="visitMsg" className="mt-8" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Find Us</h2>
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
                msg.textContent = '✅ Thanks! Your visit request has been received.';
                form.reset();
              } else {
                msg.textContent = '❌ ' + (json.message || 'Unable to send. Please try again.');
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

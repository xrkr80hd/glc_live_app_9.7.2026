import Script from "next/script";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSiteFooter } from "@/components/ChurchSiteFooter";

export default function VisitPage() {
  return (
    <>
      <ChurchHeader active="home" />

      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h1>Plan Your Visit</h1>
              <p className="muted">We can&apos;t wait to meet you.</p>
            </div>
            <form className="form" id="visitForm">
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
      </main>

      <ChurchSiteFooter />

      <Script id="visit-submit" strategy="afterInteractive">{`
        (function () {
          const form = document.getElementById('visitForm');
          const msg = document.getElementById('visitMsg');
          if (!form || !msg) return;

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            msg.textContent = 'Sending...';
            const formData = new FormData(form);
            const payload = {
              name: (formData.get('name') || '').toString().trim(),
              email: (formData.get('email') || '').toString().trim(),
              phone: (formData.get('phone') || '').toString().trim(),
              date: (formData.get('date') || '').toString().trim(),
              party: (formData.get('party') || '').toString().trim(),
              notes: (formData.get('notes') || '').toString().trim()
            };

            try {
              const res = await fetch('/api/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              const result = await res.json().catch(() => ({ success: false }));
              if (res.ok && result.success) {
                msg.textContent = result.message || 'Thanks — your visit request has been sent.';
                form.reset();
              } else {
                msg.textContent = result.message || 'Sorry, unable to send. Please try again later.';
              }
            } catch (error) {
              msg.textContent = 'Network error sending request.';
              console.error(error);
            }
          });
        })();
      `}</Script>
    </>
  );
}

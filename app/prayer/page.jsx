import Script from "next/script";
import { ChurchHeader } from "@/components/ChurchHeader";
import { ChurchSiteFooter } from "@/components/ChurchSiteFooter";

export default function PrayerPage() {
  return (
    <>
      <ChurchHeader active="prayer" />

      <section className="section alt">
        <div className="container flow">
          <h2>Prayer Requests</h2>
          <p className="lede">
            We believe in the power of prayer. Share your request and our team will lift it before the Lord. If you&apos;d like follow-up, include your email.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card prayer-form-card">
            <h3>Share Your Prayer Request</h3>
            <p className="muted">
              Every request goes straight to our pastoral care team. We only share publicly if you give us permission.
            </p>
            <form id="prayerForm" className="form" data-endpoint="/api/prayer-request/" noValidate>
              <div className="row">
                <div>
                  <label htmlFor="prayerName">
                    Name <span className="muted">(optional)</span>
                  </label>
                  <input id="prayerName" name="name" type="text" maxLength={120} placeholder="Your name" autoComplete="name" />
                </div>
                <div>
                  <label htmlFor="prayerEmail">
                    Email <span className="muted">(optional)</span>
                  </label>
                  <input id="prayerEmail" name="email" type="email" maxLength={160} placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>
              <label htmlFor="prayerRequest">
                How can we pray with you?
                <textarea
                  id="prayerRequest"
                  name="request"
                  rows={5}
                  required
                  placeholder="Share whatever is on your heart — big or small."
                />
              </label>
              <label className="prayer-checkbox">
                <input type="checkbox" id="prayerShare" name="sharePermission" value="yes" />
                <span>It&apos;s okay to share this request with the congregation (otherwise it stays with the pastoral team).</span>
              </label>
              <p className="note">We monitor prayer requests daily and someone will reach out if you include your contact details.</p>
              <div>
                <button className="btn" type="submit">
                  Send Request
                </button>
              </div>
            </form>
            <div id="prayerStatus" className="mt-12" role="status" aria-live="polite" />
          </div>
        </div>
      </section>

      <ChurchSiteFooter />

      <Script id="prayer-submit" strategy="afterInteractive">{`
        (function () {
          const form = document.getElementById('prayerForm');
          if (!form) return;
          const statusEl = document.getElementById('prayerStatus');
          const requestField = form.querySelector('[name="request"]');
          const submitBtn = form.querySelector('button[type="submit"]');

          const setStatus = (message, state) => {
            if (!statusEl) return;
            statusEl.textContent = message || '';
            statusEl.classList.remove('pending', 'success', 'error');
            if (state) statusEl.classList.add(state);
          };

          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const payload = {
              name: (formData.get('name') || '').toString().trim(),
              email: (formData.get('email') || '').toString().trim(),
              request: (formData.get('request') || '').toString().trim(),
              sharePermission: !!formData.get('sharePermission')
            };

            if (!payload.request) {
              setStatus('Please let us know how we can pray with you.', 'error');
              if (requestField) requestField.focus();
              return;
            }

            setStatus('Sending your request…', 'pending');
            if (submitBtn) submitBtn.disabled = true;

            try {
              const response = await fetch('/api/prayer-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              const result = await response.json().catch(() => ({}));
              if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to send your request right now.');
              }

              setStatus('Thank you for sharing. Our prayer team is on it.', 'success');
              form.reset();
            } catch (error) {
              console.error('Prayer request submission failed:', error);
              setStatus(error.message || 'We could not send your request. Please try again soon.', 'error');
            } finally {
              if (submitBtn) submitBtn.disabled = false;
            }
          });
        })();
      `}</Script>
    </>
  );
}

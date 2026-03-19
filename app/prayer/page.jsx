import Script from "next/script";
import { PublicSiteShell } from "@/components/public-site/PublicSiteShell";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";

export default function PrayerPage() {
  return (
    <PublicSiteShell>
      <div className="bg-[#F6F6F2]">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <BlurFade inView delay={0.04} className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#3F4D48] sm:text-4xl">Prayer Requests</h1>
            <p className="max-w-3xl text-base leading-7 text-[#3F4D48]">
              We believe in the power of prayer. Share your request and our team will lift it before the Lord. If you would like follow-up, include your email.
            </p>
          </BlurFade>

          <BlurFade inView delay={0.08}>
            <section className="border border-[#E3E8E6] bg-white p-4 sm:p-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#3F4D48]">Share Your Prayer Request</h2>
                <p className="text-base leading-7 text-[#3F4D48]">
                  Every request goes straight to our pastoral care team. We only share publicly if you give us permission.
                </p>
              </div>

              <form id="prayerForm" className="mt-5 space-y-4" data-endpoint="/api/prayer-request/" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label htmlFor="prayerName" className="space-y-2 text-sm font-medium text-[#3F4D48]">
                    <span>
                      Name <span className="font-normal text-[#3F4D48]/75">(optional)</span>
                    </span>
                    <input
                      id="prayerName"
                      name="name"
                      type="text"
                      maxLength={120}
                      placeholder="Your name"
                      autoComplete="name"
                      className="h-10 w-full border border-[#E3E8E6] bg-white px-3 text-base text-[#3F4D48] outline-none transition-colors placeholder:text-[#3F4D48]/55 focus:border-[#1F4D3A]"
                    />
                  </label>

                  <label htmlFor="prayerEmail" className="space-y-2 text-sm font-medium text-[#3F4D48]">
                    <span>
                      Email <span className="font-normal text-[#3F4D48]/75">(optional)</span>
                    </span>
                    <input
                      id="prayerEmail"
                      name="email"
                      type="email"
                      maxLength={160}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-10 w-full border border-[#E3E8E6] bg-white px-3 text-base text-[#3F4D48] outline-none transition-colors placeholder:text-[#3F4D48]/55 focus:border-[#1F4D3A]"
                    />
                  </label>
                </div>

                <label htmlFor="prayerRequest" className="space-y-2 text-sm font-medium text-[#3F4D48]">
                  <span>How can we pray with you?</span>
                  <textarea
                    id="prayerRequest"
                    name="request"
                    rows={5}
                    required
                    placeholder="Share whatever is on your heart - big or small."
                    className="w-full border border-[#E3E8E6] bg-white px-3 py-2 text-base leading-6 text-[#3F4D48] outline-none transition-colors placeholder:text-[#3F4D48]/55 focus:border-[#1F4D3A]"
                  />
                </label>

                <label className="flex items-start gap-2 text-sm leading-6 text-[#3F4D48]">
                  <input type="checkbox" id="prayerShare" name="sharePermission" value="yes" className="mt-1 h-4 w-4 border-[#E3E8E6]" />
                  <span>It is okay to share this request with the congregation (otherwise it stays with the pastoral team).</span>
                </label>

                <p className="text-sm leading-6 text-[#3F4D48]">
                  We monitor prayer requests daily and someone will reach out if you include your contact details.
                </p>

                <Button type="submit" className="h-10 rounded-none bg-[#1F4D3A] px-4 text-sm font-semibold text-white hover:bg-[#2E7D32]">
                  Send Request
                </Button>
              </form>

              <div id="prayerStatus" className="mt-3 text-sm text-[#3F4D48]" role="status" aria-live="polite" />
            </section>
          </BlurFade>
        </div>
      </div>

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
            statusEl.className = 'mt-3 text-sm';
            statusEl.style.color = '#3F4D48';
            if (!message) return;
            if (state === 'pending') {
              return;
            }
            if (state === 'success') {
              statusEl.style.color = '#1F4D3A';
              return;
            }
            if (state === 'error') {
              statusEl.style.color = '#B13737';
            }
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

            setStatus('Sending your request...', 'pending');
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
    </PublicSiteShell>
  );
}

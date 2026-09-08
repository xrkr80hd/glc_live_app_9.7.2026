"use client";

import { useState } from "react";
import { IconCompass, IconMapPin, IconSend } from "@tabler/icons-react";

const inputClass = "mt-1 h-11 w-full rounded-xl border border-[#C9D7D0] bg-white px-3 text-[16px] text-[#1F3128] outline-none placeholder:text-[#7B8D84] focus:border-[#2E7D52] focus:ring-2 focus:ring-[#9FD6B8]/35";
const labelClass = "grid gap-1 text-sm font-semibold text-[#2E4238]";

export function VisitPlanner({ compact = false }) {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      date: String(formData.get("date") || "").trim(),
      party: String(formData.get("party") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
    };

    setSubmitting(true);
    setStatus("Sending...");

    try {
      const response = await fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({ success: false }));

      if (response.ok && result.success) {
        setStatus(result.message || "Thanks — your visit request has been received.");
        form.reset();
      } else {
        setStatus(result.message || "Sorry, unable to send. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Network error sending request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={compact ? "space-y-8" : "space-y-10"}>
      <section id="visit" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Plan Your Visit</p>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#3F4D48] sm:text-3xl">
            <IconMapPin size={28} stroke={1.8} aria-hidden="true" />
            We Can&apos;t Wait To Meet You
          </h2>
          <p className="text-sm leading-6 text-[#3F4D48] sm:text-base">
            Tell us when you&apos;re coming and we&apos;ll help make your first visit simple.
          </p>
        </div>

        <form className="grid gap-4 rounded-2xl border border-[#D9E5DE] bg-[#F8FBF9] p-4 sm:p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              First &amp; Last Name
              <input required name="name" placeholder="Your name" className={inputClass} />
            </label>
            <label className={labelClass}>
              Email
              <input required type="email" name="email" placeholder="you@example.com" className={inputClass} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Phone
              <input name="phone" placeholder="(###) ###-####" className={inputClass} />
            </label>
            <label className={labelClass}>
              Visit Date
              <input type="date" name="date" className={inputClass} />
            </label>
          </div>

          <label className={labelClass}>
            How many are coming?
            <select name="party" defaultValue="1" className={inputClass}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </select>
          </label>

          <label className={labelClass}>
            Anything we can prepare for?
            <textarea name="notes" rows={4} placeholder="Kids check-in, accessibility needs, prayer requests..." className="mt-1 min-h-28 w-full rounded-xl border border-[#C9D7D0] bg-white px-3 py-2.5 text-[16px] text-[#1F3128] outline-none placeholder:text-[#7B8D84] focus:border-[#2E7D52] focus:ring-2 focus:ring-[#9FD6B8]/35" />
          </label>

          <div>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1F7A4C] px-5 text-sm font-bold text-white hover:bg-[#17613C] disabled:cursor-not-allowed disabled:bg-[#9EB5A8]" type="submit" disabled={submitting}>
              <IconSend size={18} stroke={1.9} aria-hidden="true" />
              {submitting ? "Sending..." : "Send"}
            </button>
          </div>
        </form>

        <div aria-live="polite" className="min-h-6 text-sm text-[#3F4D48]">
          {status}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#3F4D48] sm:text-3xl">
          <IconCompass size={28} stroke={1.8} aria-hidden="true" />
          Find Us
        </h2>
        <div className="map overflow-hidden border border-[#E3E8E6] bg-white">
          <iframe
            title="Map to Liberty Church"
            frameBorder="0"
            src="https://www.google.com/maps?q=100%20McKeithen%20Dr%2C%20Alexandria%2C%20LA%2071303&output=embed"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}

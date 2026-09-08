"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const AUTO_ROTATE_MS = 9500;

export function HomeAnnouncementsCarousel({ announcements = [], variant = "main" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = announcements.length;
  const hasMultiple = total > 1;
  const youth = variant === "youth";

  useEffect(() => {
    if (!total) return;
    setActiveIndex((current) => Math.min(current, total - 1));
  }, [total]);

  useEffect(() => {
    if (!hasMultiple) return;
    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(timerId);
  }, [hasMultiple, total]);

  if (!total) {
    return (
      <article className={youth ? "border border-[#38516c] bg-[#101a2b] px-6 py-7 text-[#cbd9e8]" : "border border-[#E1E7E4] bg-white px-6 py-7 text-[#4B6354]"}>
        No announcements at this time.
      </article>
    );
  }

  const announcement = announcements[activeIndex];

  function previous() {
    setActiveIndex((current) => (current - 1 + total) % total);
  }

  function next() {
    setActiveIndex((current) => (current + 1) % total);
  }

  return (
    <div className="w-full">
      <article className={youth ? "overflow-hidden border border-[#36506c] bg-[#0d1727] shadow-[0_12px_36px_rgba(0,0,0,.28)]" : "overflow-hidden border border-[#E1E7E4] bg-white"}>
        <div className="space-y-4 px-6 pb-7 pt-7 sm:px-10 sm:pb-9 sm:pt-9">
          {announcement.dateLabel ? (
            <p className={youth ? "text-xs font-extrabold uppercase tracking-[0.16em] text-[#66e49e] sm:text-sm" : "text-xs font-extrabold uppercase tracking-[0.16em] text-[#23854A] sm:text-sm"}>
              {announcement.dateLabel}
            </p>
          ) : null}
          <h3 className={youth ? "text-[1.45rem] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[1.75rem]" : "text-[1.45rem] font-bold leading-tight tracking-[-0.02em] text-[#344942] sm:text-[1.75rem]"}>
            {announcement.title}
          </h3>
          {announcement.body ? (
            <p className={youth ? "whitespace-pre-line text-[1rem] leading-7 text-[#c5d3e2] sm:text-[1.08rem] sm:leading-8" : "whitespace-pre-line text-[1rem] leading-7 text-[#52675F] sm:text-[1.08rem] sm:leading-8"}>
              {announcement.body}
            </p>
          ) : null}
        </div>

        {announcement.imageUrl ? (
          <div className={youth ? "relative aspect-[16/10] w-full overflow-hidden bg-[#07111f]" : "relative aspect-[16/10] w-full overflow-hidden bg-[#EEF3F0]"}>
            <img
              src={announcement.imageUrl}
              alt={announcement.imageAlt || announcement.title || "Liberty Church announcement"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={previous}
                  className={youth ? "absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#526a83] bg-[#0d1727]/95 text-white shadow-sm transition hover:bg-[#18263a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66e49e] sm:left-4 sm:h-14 sm:w-14" : "absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#D8E1DC] bg-white/95 text-[#36584B] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79C99A] sm:left-4 sm:h-14 sm:w-14"}
                  aria-label="Previous announcement"
                >
                  <IconChevronLeft size={20} stroke={1.9} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className={youth ? "absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#66e49e] bg-[#0d1727]/95 text-white shadow-[0_0_0_5px_rgba(102,228,158,.14)] transition hover:bg-[#18263a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66e49e] sm:right-4 sm:h-14 sm:w-14" : "absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#9BD7B3] bg-white/95 text-[#36584B] shadow-[0_0_0_5px_rgba(123,200,154,0.18)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79C99A] sm:right-4 sm:h-14 sm:w-14"}
                  aria-label="Next announcement"
                >
                  <IconChevronRight size={20} stroke={1.9} />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </article>

      {hasMultiple ? (
        <div className="mt-4 flex justify-center gap-3" aria-label="Announcement slides">
          {announcements.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-9 w-12 border transition sm:h-10 sm:w-14 ${
                index === activeIndex
                  ? youth
                    ? "border-[#66e49e] bg-[#66e49e]"
                    : "border-[#1F5A45] bg-[#1F5A45]"
                  : youth
                    ? "border-[#405875] bg-[#101a2b] hover:border-[#66e49e]"
                    : "border-[#D5DDD9] bg-white hover:border-[#79C99A]"
              }`}
              aria-label={`Show announcement ${index + 1}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

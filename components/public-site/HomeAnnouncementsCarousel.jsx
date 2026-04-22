"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const AUTO_ROTATE_MS = 9500;

function isTouchLikeDevice() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(hover: none)").matches;
}

export function HomeAnnouncementsCarousel({ announcements = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const total = announcements.length;
  const hasMultiple = total > 1;
  const isEmphasized = isHovered || isTapped;

  useEffect(() => {
    if (!total) {
      return;
    }

    setActiveIndex((current) => Math.min(current, total - 1));
  }, [total]);

  useEffect(() => {
    if (!hasMultiple || isHovered || isTapped) {
      return;
    }

    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(timerId);
  }, [hasMultiple, isHovered, isTapped, total]);

  if (!total) {
    return (
      <article className="space-y-2 border border-[#E3E8E6] bg-white px-4 py-4 sm:px-5">
        <h3 className="text-xl font-semibold text-[#3F4D48]">Updates coming soon</h3>
        <p className="text-base leading-7 text-[#3F4D48]">Announcements are being prepared for this week. Please check back shortly.</p>
      </article>
    );
  }

  const activeAnnouncement = announcements[activeIndex];

  function showPrevious() {
    setIsTapped(false);
    setActiveIndex((current) => (current - 1 + total) % total);
  }

  function showNext() {
    setIsTapped(false);
    setActiveIndex((current) => (current + 1) % total);
  }

  function handleCardClick() {
    if (!isTouchLikeDevice()) {
      return;
    }

    setIsTapped((current) => !current);
  }

  function handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    setIsTapped((current) => !current);
  }

  return (
    <div className="relative">
      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-2 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#D4DBD7] bg-[#F6F6F2]/95 text-[#1F4D3A] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32]"
            aria-label="Show previous announcement"
          >
            <IconChevronLeft size={22} stroke={2.1} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-2 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#D4DBD7] bg-[#F6F6F2]/95 text-[#1F4D3A] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32]"
            aria-label="Show next announcement"
          >
            <IconChevronRight size={22} stroke={2.1} aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden px-0 sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={activeAnnouncement.id || activeIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isEmphasized ? 1.015 : 1,
              boxShadow: isEmphasized ? "0 24px 56px rgba(31, 77, 58, 0.18)" : "0 8px 20px rgba(63, 77, 72, 0.08)",
            }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border border-[#E3E8E6] bg-white md:grid md:grid-cols-[1.05fr_0.95fr]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-roledescription="carousel slide"
            aria-label={`Announcement ${activeIndex + 1} of ${total}: ${activeAnnouncement.title}`}
            aria-pressed={isEmphasized}
          >
            <div className="flex h-full flex-col justify-center space-y-2 px-6 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2E7D32]">{activeAnnouncement.dateLabel}</p>
              </div>
              <h3 className="text-xl font-semibold text-[#3F4D48] sm:text-[1.6rem]">{activeAnnouncement.title}</h3>
              <p className="text-base leading-7 text-[#3F4D48]">{activeAnnouncement.body}</p>
            </div>

            {activeAnnouncement.imageUrl ? (
              <div className="relative aspect-[16/10] max-h-[220px] overflow-hidden border-t border-[#E3E8E6] bg-[#EEF1ED] sm:aspect-[4/3] sm:max-h-[280px] md:max-h-none md:border-l md:border-t-0">
                <img
                  src={activeAnnouncement.imageUrl}
                  alt={activeAnnouncement.imageAlt}
                  loading="lazy"
                  className="absolute inset-0 block h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="hidden border-l border-[#E3E8E6] bg-[#EEF1ED] md:block" />
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      {hasMultiple ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {announcements.map((announcement, index) => (
            <button
              key={announcement.id || index}
              type="button"
              onClick={() => {
                setIsTapped(false);
                setActiveIndex(index);
              }}
              className={`h-2.5 w-8 border transition ${index === activeIndex ? "border-[#1F4D3A] bg-[#1F4D3A]" : "border-[#C8D1CC] bg-transparent hover:border-[#2E7D32]"}`}
              aria-label={`Show announcement ${index + 1}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

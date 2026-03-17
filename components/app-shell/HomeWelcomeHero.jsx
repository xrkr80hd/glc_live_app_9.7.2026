"use client";

import { useEffect, useState } from "react";

const HERO_VIDEOS = [
  "https://www.golibertychurch.com/assets/hero_vids/bible_hero.mp4",
  "https://www.golibertychurch.com/assets/hero_vids/the_cross_hero.mp4",
  "https://www.golibertychurch.com/assets/hero_vids/worship_hero.mp4",
  "https://www.golibertychurch.com/assets/hero_vids/worship_hero_1.mp4",
];

const HERO_ROTATE_MS = 12000;

export function HomeWelcomeHero({ firstName = "", fullName = "" }) {
  const safeFirstName = String(firstName || "").trim();
  const safeFullName = String(fullName || "").trim();
  const welcomeTitle = safeFirstName ? `Welcome, ${safeFirstName}` : "Welcome";
  const subtitle = safeFullName || safeFirstName || "Member";
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const randomStart = Math.floor(Math.random() * HERO_VIDEOS.length);
    setVideoIndex(randomStart);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setVideoIndex((current) => (current + 1) % HERO_VIDEOS.length);
    }, HERO_ROTATE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const activeVideo = HERO_VIDEOS[videoIndex] || HERO_VIDEOS[0];

  return (
    <section className="lc-card lc-home-welcome-hero" aria-label="Member home welcome">
      <div className="lc-home-welcome-media" aria-hidden="true">
        <video key={activeVideo} autoPlay muted loop playsInline preload="metadata" className="lc-home-welcome-video">
          <source src={activeVideo} type="video/mp4" />
        </video>
        <div className="lc-home-welcome-overlay" />
      </div>

      <div className="lc-home-welcome-copy">
        <h1>{welcomeTitle}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}

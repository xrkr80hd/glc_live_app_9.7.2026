"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconVolume, IconVolume2, IconVolumeOff } from "@tabler/icons-react";

function normalizeText(value) {
  return String(value || "").trim();
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

function normalizeCard(item, index) {
  const mediaType = normalizeText(item?.media_type).toLowerCase();
  return {
    id: normalizeText(item?.id) || `card-${index}`,
    title: normalizeText(item?.title),
    body: normalizeText(item?.body),
    media_url: normalizeText(item?.media_url),
    media_type: mediaType === "video" || mediaType === "image" ? mediaType : "",
    cta_label: normalizeText(item?.cta_label),
    cta_url: normalizeText(item?.cta_url),
    display_seconds: clampInteger(item?.display_seconds, 12, 5, 120),
    enable_audio: Boolean(item?.enable_audio),
    volume_percent: clampInteger(item?.volume_percent, 25, 0, 100),
  };
}

export function HighlightShowcaseCard({ cards }) {
  const normalizedCards = useMemo(() => {
    const entries = Array.isArray(cards)
      ? cards
          .map((item, index) => normalizeCard(item, index))
          .filter((item) => item.title || item.body || item.media_url)
      : [];

    if (entries.length) {
      return entries;
    }

    return [
      {
        id: "fallback-highlight",
        title: "Welcome to Liberty Church",
        body: "Join us Sundays at 10:00 AM. We would love to worship with you.",
        media_url: "",
        media_type: "",
        cta_label: "",
        cta_url: "",
        display_seconds: 12,
        enable_audio: false,
        volume_percent: 25,
      },
    ];
  }, [cards]);

  const [index, setIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.25);
  const videoRef = useRef(null);

  useEffect(() => {
    if (index >= normalizedCards.length) {
      setIndex(0);
    }
  }, [index, normalizedCards.length]);

  const activeCard = normalizedCards[index] || normalizedCards[0];
  const mediaUrl = normalizeText(activeCard?.media_url);
  const mediaType = normalizeText(activeCard?.media_type).toLowerCase();
  const isVideo = Boolean(mediaUrl && mediaType === "video");
  const audioEnabled = Boolean(isVideo && activeCard?.enable_audio);

  useEffect(() => {
    if (normalizedCards.length <= 1) {
      return undefined;
    }
    const seconds = clampInteger(activeCard?.display_seconds, 12, 5, 120);
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % normalizedCards.length);
    }, seconds * 1000);

    return () => clearTimeout(timer);
  }, [activeCard?.display_seconds, normalizedCards.length, index]);

  useEffect(() => {
    const nextVolume = clampInteger(activeCard?.volume_percent, 25, 0, 100) / 100;
    setVolume(nextVolume);
    setIsMuted(true);
  }, [activeCard?.id, activeCard?.volume_percent]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.volume = volume;
    video.muted = !audioEnabled || isMuted || volume <= 0;
    const playback = video.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {});
    }
  }, [audioEnabled, isMuted, volume, activeCard?.id]);

  function toggleMute() {
    if (!audioEnabled) {
      return;
    }
    setIsMuted((current) => !current);
  }

  function onVolumeChange(event) {
    const next = clampInteger(event.target.value, 25, 0, 100) / 100;
    setVolume(next);
    if (next <= 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }

  const volumePercent = Math.round(volume * 100);

  return (
    <article className="seasonal-card theater-card" aria-label="Homepage highlight card">
      {mediaUrl ? (
        <div className="seasonal-media theater-media" aria-hidden="true">
          {isVideo ? (
            <video
              key={`highlight-video-${activeCard.id}-${mediaUrl}`}
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={mediaUrl} />
            </video>
          ) : (
            <img src={mediaUrl} alt="" loading="lazy" />
          )}
        </div>
      ) : null}

      <div className="seasonal-overlay theater-overlay" />

      <div className="seasonal-content theater-content">
        <div key={`message-${activeCard.id}-${index}`} className="theater-message">
          {activeCard.title ? <h2>{activeCard.title}</h2> : null}
          {activeCard.body ? <p>{activeCard.body}</p> : null}
          {activeCard.cta_label && activeCard.cta_url ? (
            <div className="theater-card-actions">
              <a href={activeCard.cta_url} className="btn ghost">
                {activeCard.cta_label}
              </a>
            </div>
          ) : null}
        </div>

        {normalizedCards.length > 1 ? (
          <div className="theater-dots" aria-hidden="true">
            {normalizedCards.map((item, dotIndex) => (
              <span key={`dot-${item.id}`} className={dotIndex === index ? "dot dot-active" : "dot"} />
            ))}
          </div>
        ) : null}
      </div>

      {audioEnabled ? (
        <div className="theater-audio-controls">
          <button
            type="button"
            className="theater-audio-toggle"
            aria-label={isMuted || volume <= 0 ? "Unmute highlight video" : "Mute highlight video"}
            onClick={toggleMute}
          >
            {isMuted || volume <= 0 ? (
              <IconVolumeOff size={16} stroke={1.9} aria-hidden="true" />
            ) : volumePercent < 55 ? (
              <IconVolume size={16} stroke={1.9} aria-hidden="true" />
            ) : (
              <IconVolume2 size={16} stroke={1.9} aria-hidden="true" />
            )}
          </button>
          <input
            className="theater-audio-range"
            type="range"
            min="0"
            max="100"
            step="1"
            value={volumePercent}
            onChange={onVolumeChange}
            aria-label="Highlight card volume"
          />
        </div>
      ) : null}
    </article>
  );
}

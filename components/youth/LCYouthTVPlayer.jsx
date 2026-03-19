"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconPlayerPlay, IconPlayerStop, IconPlayerTrackNext, IconPlayerTrackPrev, IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => ({
      id: String(item?.id || `item-${index}`),
      kind: String(item?.kind || "photo"),
      src: String(item?.src || "").trim(),
      poster: String(item?.poster || "").trim(),
      caption: String(item?.caption || "").trim(),
    }))
    .filter((item) => item.src && (item.kind === "photo" || item.kind === "video" || item.kind === "embed"));
}

function getRandomNextIndex(total, current) {
  if (total <= 1) {
    return current;
  }

  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * total);
  }
  return next;
}

export function LCYouthTVPlayer({ items = [], className = "" }) {
  const mediaItems = useMemo(() => normalizeItems(items), [items]);
  const initialIndex = useMemo(() => {
    const firstVideoIndex = mediaItems.findIndex((item) => item.kind === "video");
    return firstVideoIndex >= 0 ? firstVideoIndex : 0;
  }, [mediaItems]);
  const videoRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaybackStopped, setIsPlaybackStopped] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volumePercent, setVolumePercent] = useState(70);
  const activeItem = mediaItems[activeIndex] || mediaItems[0] || null;
  const goRandomNext = useCallback(() => {
    setActiveIndex((current) => getRandomNextIndex(mediaItems.length, current));
  }, [mediaItems.length]);

  useEffect(() => {
    setIsPlaybackStopped(false);
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (mediaItems.length <= 1) {
      return undefined;
    }

    if (isPlaybackStopped) {
      return undefined;
    }

    // Let direct videos finish naturally; randomize on `onEnded` instead.
    if (activeItem?.kind === "video") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      goRandomNext();
    }, 9000);

    return () => window.clearInterval(timer);
  }, [activeItem?.kind, goRandomNext, isPlaybackStopped, mediaItems.length]);

  const goPrevious = useCallback(() => {
    if (mediaItems.length <= 1) {
      return;
    }
    setActiveIndex((current) => (current - 1 + mediaItems.length) % mediaItems.length);
  }, [mediaItems.length]);

  const goNext = useCallback(() => {
    if (mediaItems.length <= 1) {
      return;
    }
    setActiveIndex((current) => (current + 1) % mediaItems.length);
  }, [mediaItems.length]);

  const handlePlay = useCallback(() => {
    setIsPlaybackStopped(false);
    const player = videoRef.current;
    if (player) {
      player.play().catch(() => {});
    }
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaybackStopped(true);
    const player = videoRef.current;
    if (player) {
      player.pause();
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((current) => {
      const nextMuted = !current;
      const player = videoRef.current;
      if (player) {
        player.muted = nextMuted;
        if (!nextMuted && volumePercent === 0) {
          const fallbackVolume = 70;
          setVolumePercent(fallbackVolume);
          player.volume = fallbackVolume / 100;
        }
      }
      return nextMuted;
    });
  }, [volumePercent]);

  const handleVolumeChange = useCallback((event) => {
    const nextValue = Number.parseInt(event.target.value, 10);
    const safeValue = Number.isFinite(nextValue) ? Math.min(100, Math.max(0, nextValue)) : 0;
    setVolumePercent(safeValue);

    const player = videoRef.current;
    if (player) {
      player.volume = safeValue / 100;
      player.muted = safeValue === 0;
    }

    setIsMuted(safeValue === 0);
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (!isPlaybackStopped && mediaItems.length > 1) {
      goRandomNext();
    }
  }, [goRandomNext, isPlaybackStopped, mediaItems.length]);

  if (!mediaItems.length) {
    return null;
  }

  return (
    <section className={cn("lc-youth-tv-player", className)}>
      <div className="lc-youth-tv-wrap">
        <div className="lc-youth-tv-backplate" aria-hidden="true" />
        <div className="lc-youth-tv-frame-wrap">
        <div className="lc-youth-tv-screen">
          {activeItem.kind === "photo" ? (
            <img src={activeItem.src} alt={activeItem.caption || "LC Youth media"} className="lc-youth-tv-media is-photo" loading="lazy" />
          ) : activeItem.kind === "video" ? (
            <video
              ref={videoRef}
              key={activeItem.src}
              className="lc-youth-tv-media is-video"
              autoPlay={!isPlaybackStopped}
              muted={isMuted}
              loop={mediaItems.length <= 1 && !isPlaybackStopped}
              playsInline
              preload="metadata"
              poster={activeItem.poster || undefined}
              onEnded={handleVideoEnded}
              onLoadedData={(event) => {
                const player = event.currentTarget;
                player.volume = Math.min(1, Math.max(0, volumePercent / 100));
                player.muted = isMuted;
                if (!isPlaybackStopped && player.paused) {
                  player.play().catch(() => {});
                }
              }}
              onError={mediaItems.length > 1 ? goRandomNext : undefined}
            >
              <source src={activeItem.src} />
            </video>
          ) : (
            <iframe
              src={activeItem.src}
              className="lc-youth-tv-media is-embed"
              title={activeItem.caption || "LC Youth video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
        <img src="/assets/lc_youth_tv.png" alt="" className="lc-youth-tv-frame" aria-hidden="true" />
        </div>
      </div>

      <div className="lc-youth-tv-controls">
        <button type="button" className="lc-youth-tv-control-btn" onClick={goPrevious} disabled={mediaItems.length <= 1} aria-label="Previous media">
          <IconPlayerTrackPrev className="lc-youth-tv-control-icon" size={14} stroke={2} aria-hidden="true" />
        </button>
        <button type="button" className={cn("lc-youth-tv-control-btn", !isPlaybackStopped && "is-active")} onClick={handlePlay} aria-label="Play media">
          <IconPlayerPlay className="lc-youth-tv-control-icon" size={14} stroke={2} aria-hidden="true" />
        </button>
        <button type="button" className={cn("lc-youth-tv-control-btn", isPlaybackStopped && "is-active")} onClick={handleStop} aria-label="Stop media">
          <IconPlayerStop className="lc-youth-tv-control-icon" size={14} stroke={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={cn("lc-youth-tv-control-btn lc-youth-tv-sound-btn", !isMuted && "is-active")}
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          aria-pressed={!isMuted}
        >
          {isMuted ? <IconVolumeOff className="lc-youth-tv-control-icon" size={14} stroke={2} aria-hidden="true" /> : <IconVolume className="lc-youth-tv-control-icon" size={14} stroke={2} aria-hidden="true" />}
        </button>
        <label className="lc-youth-tv-volume-wrap" aria-label="Volume slider">
          <span className="lc-youth-tv-volume-label">Vol</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volumePercent}
            onChange={handleVolumeChange}
            className="lc-youth-tv-volume-slider"
          />
        </label>
        <button type="button" className="lc-youth-tv-control-btn" onClick={goNext} disabled={mediaItems.length <= 1} aria-label="Next media">
          <IconPlayerTrackNext className="lc-youth-tv-control-icon" size={14} stroke={2} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

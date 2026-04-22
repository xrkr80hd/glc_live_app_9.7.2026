"use client";

import { useEffect, useMemo, useState } from "react";

export function LiveStreamClient({
  title,
  isLive,
  liveEmbedUrl,
  fallbackVideoUrl,
  note,
  autoSwitchEnabled = false,
  statusPollMs = 30000,
}) {
  const [liveState, setLiveState] = useState({
    title: title || "Live Stream",
    isLive: Boolean(isLive),
    liveEmbedUrl: liveEmbedUrl || "",
    fallbackVideoUrl: fallbackVideoUrl || "",
    note: note || "",
  });
  const [showLive, setShowLive] = useState(Boolean(isLive));

  useEffect(() => {
    setLiveState({
      title: title || "Live Stream",
      isLive: Boolean(isLive),
      liveEmbedUrl: liveEmbedUrl || "",
      fallbackVideoUrl: fallbackVideoUrl || "",
      note: note || "",
    });
    setShowLive(Boolean(isLive));
  }, [title, isLive, liveEmbedUrl, fallbackVideoUrl, note]);

  useEffect(() => {
    if (!autoSwitchEnabled) {
      return undefined;
    }

    let mounted = true;
    const pollInterval = Number.isFinite(statusPollMs) && statusPollMs >= 5000 ? statusPollMs : 30000;

    const pollLiveStatus = async () => {
      try {
        const response = await fetch("/api/live-status", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (!mounted) {
          return;
        }

        setLiveState({
          title: data.title || "Live Stream",
          isLive: Boolean(data.isLive),
          liveEmbedUrl: data.liveEmbedUrl || "",
          fallbackVideoUrl: data.fallbackVideoUrl || fallbackVideoUrl || "",
          note: data.note || note || "",
        });

        if (data.isLive && data.liveEmbedUrl) {
          setShowLive(true);
        }
      } catch {
        // Fail silent; keep current state.
      }
    };

    pollLiveStatus();
    const timer = window.setInterval(pollLiveStatus, pollInterval);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [autoSwitchEnabled, statusPollMs, fallbackVideoUrl, note]);

  const showVideoPlayer = useMemo(
    () => !showLive && Boolean(liveState.fallbackVideoUrl),
    [showLive, liveState.fallbackVideoUrl],
  );

  return (
    <div className="stack-lg">
      <h1>Watch Live</h1>
      <p>
        {liveState.title || "Join us online during service and catch replays throughout the week."}
      </p>

      <div className="video-wrap">
        {showLive && liveState.isLive && liveState.liveEmbedUrl ? (
          <iframe
            src={liveState.liveEmbedUrl}
            title="Liberty Church Livestream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : null}

        {!showLive && showVideoPlayer ? (
          <video className="fallback-video" autoPlay muted loop playsInline controls={false}>
            <source src={liveState.fallbackVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : null}

        {!showLive && !showVideoPlayer ? (
          <div className="video-empty">Fallback video is not configured yet.</div>
        ) : null}
      </div>

      {!showLive ? <p className="note-text">{liveState.note}</p> : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export function HomeWelcomeToast({ firstName }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef(null);
  const removeTimerRef = useRef(null);

  const safeFirstName = String(firstName || "").trim();
  const message = safeFirstName ? `Welcome back, ${safeFirstName}` : "Welcome back";

  function dismissToast() {
    if (isExiting || !isVisible) {
      return;
    }

    setIsExiting(true);
    removeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 280);
  }

  useEffect(() => {
    closeTimerRef.current = setTimeout(() => {
      dismissToast();
    }, 4000);

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (removeTimerRef.current) {
        clearTimeout(removeTimerRef.current);
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="lc-home-toast-wrap">
      <div className={`lc-home-toast${isExiting ? " is-exit" : ""}`} role="status" aria-live="polite">
        <span className="lc-home-toast-chip">Welcome</span>
        <span className="lc-home-toast-text">{message}</span>
      </div>
    </div>
  );
}

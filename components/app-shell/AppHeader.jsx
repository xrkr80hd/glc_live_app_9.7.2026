"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconMoonStars, IconSunHigh, IconUserCircle } from "@tabler/icons-react";

function buildInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "LC";
}

export function AppHeader({ kicker, title, subtitle, theme = "member", showProfileShortcut = true, headerAction = null }) {
  const [profileShortcut, setProfileShortcut] = useState({
    fullName: "",
    photoUrl: "",
  });
  const [appTheme, setAppTheme] = useState("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("lc-app-theme");
    const resolvedTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";

    setAppTheme(resolvedTheme);
    document.documentElement.dataset.appTheme = resolvedTheme;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProfileShortcut() {
      if (!showProfileShortcut) {
        return;
      }

      try {
        const response = await fetch("/api/member-auth/profile", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.success || !isMounted) {
          return;
        }

        setProfileShortcut({
          fullName: payload.member?.fullName || "",
          photoUrl: payload.member?.photoUrl || "",
        });
      } catch {
        // Keep the default icon if profile lookup fails.
      }
    }

    loadProfileShortcut();

    return () => {
      isMounted = false;
    };
  }, [showProfileShortcut]);

  const initials = buildInitials(profileShortcut.fullName);

  function toggleTheme() {
    const nextTheme = appTheme === "dark" ? "light" : "dark";
    setAppTheme(nextTheme);
    document.documentElement.dataset.appTheme = nextTheme;
    window.localStorage.setItem("lc-app-theme", nextTheme);
  }

  return (
    <header className="lc-app-header">
      <div className="lc-app-header-top">
        <Link href="/member" className="lc-brand-lockup" aria-label="Go to Liberty Church member home">
          <Image src="/assets/logo.png" alt="" width={28} height={28} className="lc-brand-mark" />
          <span>Liberty Church</span>
        </Link>
        <div className="lc-app-header-actions">
          {headerAction}
          {theme === "member" ? (
            <button type="button" className="lc-theme-toggle" onClick={toggleTheme} aria-label={appTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {appTheme === "dark" ? <IconSunHigh size={20} stroke={1.8} /> : <IconMoonStars size={20} stroke={1.8} />}
            </button>
          ) : null}
          {showProfileShortcut ? (
            <Link href="/member/profile" className="lc-profile-shortcut" aria-label="Open profile">
              {profileShortcut.photoUrl ? (
                <img src={profileShortcut.photoUrl} alt="Your profile" className="lc-profile-shortcut-image" />
              ) : initials ? (
                <span className="lc-profile-shortcut-initials">{initials}</span>
              ) : (
                <IconUserCircle size={24} stroke={1.8} />
              )}
            </Link>
          ) : null}
        </div>
      </div>
      {title || subtitle || kicker ? (
        <div className="lc-app-header-copy">
          {kicker ? <p className="lc-app-header-kicker">{kicker}</p> : null}
          {title ? <h1 className="lc-app-header-title">{title}</h1> : null}
          {subtitle ? <p className="lc-app-header-subtitle">{subtitle}</p> : null}
        </div>
      ) : null}
    </header>
  );
}

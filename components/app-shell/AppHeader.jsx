"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconUserCircle } from "@tabler/icons-react";
import { GlobalHeaderBar } from "@/components/shared/GlobalHeaderBar";

function buildInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "LC";
}

export function AppHeader({
  kicker,
  title,
  subtitle,
  theme = "member",
  showProfileShortcut = true,
  headerAction = null,
  compactHeader = false,
  headerVideoUrl = null,
  headerLogoSrc = "/assets/lc_logo_new_dark.png",
  headerBrandLabel = "Liberty Church",
}) {
  const [resolvedAppTheme, setResolvedAppTheme] = useState("light");
  const [profileShortcut, setProfileShortcut] = useState({
    fullName: "",
    photoUrl: "",
  });
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);

  useEffect(() => {
    if (theme !== "member") {
      document.documentElement.dataset.appTheme = "light";
      setResolvedAppTheme("light");
      return;
    }

    const storedTheme = window.localStorage.getItem("lc-app-theme");
    const resolvedTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
    document.documentElement.dataset.appTheme = resolvedTheme;
    setResolvedAppTheme(resolvedTheme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "member") {
      return undefined;
    }

    const root = document.documentElement;
    const syncThemeFromDom = () => {
      const nextTheme = root.dataset.appTheme === "dark" ? "dark" : "light";
      setResolvedAppTheme(nextTheme);
    };

    const observer = new MutationObserver(syncThemeFromDom);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-app-theme"],
    });

    syncThemeFromDom();
    return () => observer.disconnect();
  }, [theme]);

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
          photoUrl: payload.member?.photoUrl || payload.member?.profilePhotoUrl || "",
        });
        setPhotoLoadFailed(false);
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
  const resolvedLogoSrc = "/assets/lc_logo_new_dark.png";
  const isYouthTheme = theme === "youth";
  const youthHeaderClassName = isYouthTheme
    ? "border-[#66e49e]/35 bg-[linear-gradient(90deg,#172034_0%,#21314f_50%,#172034_100%)]"
    : "";
  const youthBrandTextStyle = isYouthTheme
    ? { textShadow: "0 0 10px rgba(102, 228, 158, 0.58), 0 0 22px rgba(102, 228, 158, 0.28)" }
    : undefined;
  const logoSrc = theme === "youth" ? "/assets/lc_youth_logo_new.png" : resolvedLogoSrc || headerLogoSrc;

  return (
    <header className="lc-app-header">
      <GlobalHeaderBar
        sticky={false}
        className={youthHeaderClassName}
        maxWidthClassName="max-w-none"
        innerClassName="px-0 sm:px-0 lg:px-0"
      >
        <div className="lc-app-header-top w-full px-2">
          <span className="lc-header-left-spacer" aria-hidden="true" />
          <Link href="/member" className="lc-brand-lockup" aria-label="Go to Liberty Church member home">
            <Image src={logoSrc} alt="" width={28} height={28} className="lc-brand-mark" />
            <span className={isYouthTheme ? "text-[#dcfff1]" : undefined} style={youthBrandTextStyle}>
              {headerBrandLabel}
            </span>
          </Link>
          <div className="lc-app-header-actions">
            {headerAction}
            {showProfileShortcut ? (
              <Link href="/member/profile" className="lc-profile-shortcut" aria-label="Open profile">
                {profileShortcut.photoUrl && !photoLoadFailed ? (
                  <img
                    src={profileShortcut.photoUrl}
                    alt="Your profile"
                    className="lc-profile-shortcut-image"
                    onError={() => setPhotoLoadFailed(true)}
                  />
                ) : initials ? (
                  <span className="lc-profile-shortcut-initials">{initials}</span>
                ) : (
                  <IconUserCircle size={24} stroke={1.8} />
                )}
              </Link>
            ) : null}
          </div>
        </div>
      </GlobalHeaderBar>
      {title || subtitle || kicker ? (
        <div className={`lc-app-header-copy${compactHeader ? " is-compact" : ""}`}>
          {headerVideoUrl ? (
            <div className="lc-app-header-copy-media" aria-hidden="true">
              <video autoPlay muted loop playsInline preload="metadata">
                <source src={headerVideoUrl} type="video/mp4" />
              </video>
            </div>
          ) : null}
          <div className="lc-app-header-copy-body">
            {kicker ? <p className="lc-app-header-kicker">{kicker}</p> : null}
            {title ? <h1 className="lc-app-header-title">{title}</h1> : null}
            {subtitle ? <p className="lc-app-header-subtitle">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBible,
  IconBroadcast,
  IconFlame,
  IconHeartDollar,
  IconHeartHandshake,
  IconHome2,
  IconMicrophone2,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/live", key: "live", label: "Watch Live", icon: IconBroadcast },
  { href: "/", key: "home", label: "Home", icon: IconHome2 },
  { href: "/youth", key: "youth", label: "LC Youth", icon: IconFlame },
  { href: "/beliefs", key: "beliefs", label: "Beliefs", icon: IconBible },
  { href: "/sermons", key: "sermons", label: "Sermons", icon: IconMicrophone2 },
  { href: "/prayer", key: "prayer", label: "Prayer", icon: IconHeartHandshake },
  { href: "/give", key: "give", label: "Give", icon: IconHeartDollar },
];

export function ChurchHeader({ active = "", youthBrand = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);

    const handlePointerDown = (event) => {
      if (!headerRef.current || !headerRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    const handleResize = () => {
      if (window.matchMedia("(min-width: 900px)").matches) {
        closeMenu();
      }
    };

    const handleScroll = () => {
      if (window.matchMedia("(max-width: 899px)").matches) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="header site-header" ref={headerRef}>
      <div className="container nav">
        {youthBrand ? (
          <a className="brand" href="/">
            <img src="/assets/logo.png" alt="Liberty Church logo" />
            <span className="brand-title">
              <span className="brand-plain">Liberty Church</span>
              <span className="youth-mark">YOUTH</span>
            </span>
          </a>
        ) : (
          <a className="brand" href="/">
            <img src="/assets/logo.png" alt="Liberty Church logo" />
            <span className="name">Liberty Church</span>
          </a>
        )}

        <button
          className="nav-toggle"
          aria-expanded={menuOpen ? "true" : "false"}
          aria-controls="mainNav"
          data-managed-nav="react"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="hamburger" aria-hidden="true" />
          <span className="sr-only">{menuOpen ? "Close navigation" : "Open navigation"}</span>
        </button>

        <nav id="mainNav" className={menuOpen ? "open" : undefined}>
          <ul>
            {NAV_ITEMS.map((item) => {
              const ItemIcon = item.icon;
              return (
                <li key={item.key}>
                  <a href={item.href} className={active === item.key ? "active" : undefined} onClick={() => setMenuOpen(false)}>
                    <span className="nav-item-label">
                      <ItemIcon size={16} stroke={1.8} aria-hidden="true" />
                      <span>{item.label}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

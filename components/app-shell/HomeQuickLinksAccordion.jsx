"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBellRinging,
  IconBroadcast,
  IconChevronDown,
  IconFlame,
  IconHeartDollar,
  IconLayoutGrid,
  IconPlayerPlay,
  IconPray,
  IconUserCircle,
} from "@tabler/icons-react";

const SLOT_COUNT = 4;
const STORAGE_KEY = "lc-home-quick-links-v1";

const QUICK_LINK_OPTIONS = [
  { id: "live", label: "Watch Live", href: "/member/live", icon: IconBroadcast },
  { id: "sermons", label: "Sermons", href: "/member/sermons", icon: IconPlayerPlay },
  { id: "prayer", label: "Prayer", href: "/member/prayer", icon: IconPray },
  { id: "give", label: "Give", href: "/member/give", icon: IconHeartDollar },
  { id: "youth", label: "Youth", href: "/member/youth", icon: IconFlame },
  { id: "announcements", label: "Announcements", href: "/member/announcements", icon: IconBellRinging },
  { id: "profile", label: "Profile", href: "/member/profile", icon: IconUserCircle },
  { id: "more", label: "More", href: "/member/more", icon: IconLayoutGrid },
];

const DEFAULT_LINK_IDS = ["live", "sermons", "prayer", "give"];
const LINK_BY_ID = new Map(QUICK_LINK_OPTIONS.map((option) => [option.id, option]));

function normalizeLinks(raw) {
  const ids = Array.isArray(raw) ? raw : [];
  const unique = [];

  ids.forEach((item) => {
    if (!LINK_BY_ID.has(item) || unique.includes(item)) {
      return;
    }
    unique.push(item);
  });

  DEFAULT_LINK_IDS.forEach((id) => {
    if (!unique.includes(id)) {
      unique.push(id);
    }
  });

  QUICK_LINK_OPTIONS.forEach((option) => {
    if (unique.length >= SLOT_COUNT || unique.includes(option.id)) {
      return;
    }
    unique.push(option.id);
  });

  return unique.slice(0, SLOT_COUNT);
}

export function HomeQuickLinksAccordion() {
  const [selectedIds, setSelectedIds] = useState(DEFAULT_LINK_IDS);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (!rawValue) {
        setHasLoaded(true);
        return;
      }

      const parsed = JSON.parse(rawValue);
      setSelectedIds(normalizeLinks(parsed));
    } catch {
      setSelectedIds(DEFAULT_LINK_IDS);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {
      // Ignore storage errors in private browsing or restricted environments.
    }
  }, [hasLoaded, selectedIds]);

  function updateSlot(slotIndex, nextId) {
    setSelectedIds((current) => {
      const next = [...current];
      const existingIndex = next.indexOf(nextId);

      if (existingIndex !== -1 && existingIndex !== slotIndex) {
        const currentValue = next[slotIndex];
        next[slotIndex] = nextId;
        next[existingIndex] = currentValue;
        return normalizeLinks(next);
      }

      next[slotIndex] = nextId;
      return normalizeLinks(next);
    });
  }

  const activeLinks = normalizeLinks(selectedIds).map((id) => LINK_BY_ID.get(id)).filter(Boolean);

  return (
    <details className="lc-accordion-card lc-home-quick-links" open>
      <summary className="lc-accordion-summary">
        <span className="lc-accordion-copy">
          <strong>Quick Links</strong>
          <span>Tap to open. Use the dropdowns below to customize these four buttons.</span>
        </span>
        <span className="lc-accordion-chevron" aria-hidden="true">
          <IconChevronDown size={18} stroke={2} />
        </span>
      </summary>

      <div className="lc-accordion-panel">
        <div className="lc-home-quick-links-grid">
          {activeLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link key={link.id} href={link.href} className="lc-home-quick-link">
                <Icon size={20} stroke={1.9} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <section className="lc-card alt lc-home-quick-links-edit">
        <div className="lc-section-head">
          <h3>Edit Quick Links</h3>
          <p className="lc-muted">Choose the 4 links shown in the quick links block above.</p>
        </div>
        <div className="lc-home-quick-links-editor">
          {selectedIds.map((selectedId, index) => (
            <label key={`quick-link-slot-${index}`} className="lc-home-quick-links-field">
              <span>Quick Link {index + 1}</span>
              <select value={selectedId} className="lc-select" onChange={(event) => updateSlot(index, event.target.value)}>
                {QUICK_LINK_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>
    </details>
  );
}

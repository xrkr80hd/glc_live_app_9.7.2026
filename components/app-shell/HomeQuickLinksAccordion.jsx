"use client";

import { IconBible, IconChevronDown, IconHeartDollar, IconLayoutDashboard, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";

const STATIC_QUICK_LINKS = [
  { id: "dashboard", label: "My Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { id: "give", label: "Give", href: "/member/give", icon: IconHeartDollar },
  { id: "sermons", label: "Sermons", href: "/member/sermons", icon: IconPlayerPlay },
  { id: "beliefs", label: "Beliefs", href: "/member/beliefs", icon: IconBible },
];

export function HomeQuickLinksAccordion() {
  return (
    <details className="lc-accordion-card lc-home-quick-links" open>
      <summary className="lc-accordion-summary">
        <span className="lc-accordion-copy">
          <strong>Quick Links</strong>
          <span>Fast access to your dashboard and key sections.</span>
        </span>
        <span className="lc-accordion-chevron" aria-hidden="true">
          <IconChevronDown size={18} stroke={2} />
        </span>
      </summary>

      <div className="lc-accordion-panel">
        <div className="lc-home-quick-links-list">
          {STATIC_QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.id} href={link.href} className="lc-home-quick-link">
                <Icon size={18} stroke={1.9} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </details>
  );
}

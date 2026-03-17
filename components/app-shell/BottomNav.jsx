import Link from "next/link";
import { IconBroadcast, IconFlame, IconHome2, IconLayoutGrid, IconPray } from "@tabler/icons-react";

const navItems = [
  {
    key: "home",
    href: "/member",
    label: "Home",
    icon: IconHome2,
  },
  {
    key: "live",
    href: "/member/live",
    label: "Live",
    icon: IconBroadcast,
  },
  {
    key: "prayer",
    href: "/member/prayer",
    label: "Prayer",
    icon: IconPray,
  },
  {
    key: "youth",
    href: "/member/youth",
    label: "Youth",
    icon: IconFlame,
  },
  {
    key: "more",
    href: "/member/more",
    label: "More",
    icon: IconLayoutGrid,
  },
];

export function BottomNav({ activeKey = "home" }) {
  return (
    <nav className="lc-bottom-nav" aria-label="Primary app navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === activeKey;

        return (
          <Link key={item.key} href={item.href} className={`lc-nav-link${isActive ? " is-active" : ""}`}>
            <Icon size={20} stroke={1.8} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { IconBroadcast, IconHome2, IconLayoutGrid, IconPlayerPlay, IconPray } from "@tabler/icons-react";

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
    key: "sermons",
    href: "/member/sermons",
    label: "Sermons",
    icon: IconPlayerPlay,
  },
  {
    key: "prayer",
    href: "/member/prayer",
    label: "Prayer",
    icon: IconPray,
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

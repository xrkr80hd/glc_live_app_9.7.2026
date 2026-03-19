"use client";

import { usePathname } from "next/navigation";
import { ChurchHeader } from "@/components/ChurchHeader";
import { PUBLIC_NAV_ITEMS } from "@/lib/public-nav";

function resolveActiveNavKey(pathname) {
  const item = PUBLIC_NAV_ITEMS.find((entry) => (entry.href === "/" ? pathname === "/" : pathname.startsWith(entry.href)));
  return item?.key || "home";
}

export function PublicSiteShell({ children }) {
  const pathname = usePathname();
  const activeKey = resolveActiveNavKey(pathname || "/");

  return (
    <div className="min-h-screen bg-[#F6F6F2] text-[#3F4D48]">
      <ChurchHeader active={activeKey} />
      <main className="w-full">{children}</main>
      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 text-center text-sm text-[#3F4D48]/85 sm:px-6 lg:px-8">
        <p>Liberty Church - Alexandria, Louisiana</p>
      </footer>
    </div>
  );
}

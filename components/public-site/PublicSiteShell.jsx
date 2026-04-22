"use client";

import { ChurchFooterContent } from "@/components/ChurchFooterContent";
import { ChurchHeader } from "@/components/ChurchHeader";
import { PUBLIC_NAV_ITEMS } from "@/lib/public-nav";
import { usePathname } from "next/navigation";

function resolveActiveNavKey(pathname) {
  const item = PUBLIC_NAV_ITEMS.find((entry) => (entry.href === "/" ? pathname === "/" : pathname.startsWith(entry.href)));
  return item?.key || "home";
}

export function PublicSiteShell({ children, socialLinks = [] }) {
  const pathname = usePathname();
  const activeKey = resolveActiveNavKey(pathname || "/");

  return (
    <div className="min-h-screen bg-[#F6F6F2] text-[#3F4D48]">
      <ChurchHeader active={activeKey} />
      <main className="w-full">{children}</main>
      <ChurchFooterContent socialLinks={socialLinks} theme="light" />
    </div>
  );
}

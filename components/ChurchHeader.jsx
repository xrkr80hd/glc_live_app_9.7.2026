"use client";

import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalHeaderBar } from "@/components/shared/GlobalHeaderBar";
import { PUBLIC_NAV_ITEMS } from "@/lib/public-nav";
import { cn } from "@/lib/utils";

function PublicNavLinks({ active = "", mobile = false }) {
  return PUBLIC_NAV_ITEMS.map((item) => (
    <Link
      key={item.key}
      href={item.href}
      className={cn(
        "inline-flex items-center rounded-none border-l-2 border-transparent px-3 py-2 text-[14px] font-medium tracking-[0.01em] text-white transition-colors hover:border-[#2E7D32] hover:bg-[#2E7D32] hover:text-white",
        active === item.key && "border-[#2E7D32] bg-[#2E7D32] text-white",
        mobile && "block text-base",
      )}
    >
      {item.label}
    </Link>
  ));
}

export function ChurchHeader({ active = "", youthBrand = false }) {
  const brandLabel = "Liberty Church";
  const logoSrc = youthBrand ? "/assets/lc_youth_logo_new.png" : "/assets/lc_logo_new_dark.png";
  const logoAlt = youthBrand ? "LC Youth" : "Liberty Church";
  const headerClassName = youthBrand
    ? "border-[#66e49e]/35 bg-[linear-gradient(90deg,#172034_0%,#21314f_50%,#172034_100%)]"
    : "";
  const brandTextClassName = youthBrand ? "text-[#dcfff1]" : "text-white";
  const brandTextStyle = youthBrand
    ? { textShadow: "0 0 10px rgba(102, 228, 158, 0.58), 0 0 22px rgba(102, 228, 158, 0.28)" }
    : undefined;

  return (
    <GlobalHeaderBar className={headerClassName}>
      <Link href="/" className="inline-flex items-center gap-3">
        <img src={logoSrc} alt={logoAlt} className="h-8 w-8 rounded-none object-contain" />
        <span className={cn("text-2xl font-semibold tracking-tight", brandTextClassName)} style={brandTextStyle}>
          {brandLabel}
        </span>
      </Link>

      <nav className="hidden items-center gap-0.5 md:flex">
        <PublicNavLinks active={active} />
      </nav>

      <div className="hidden items-center gap-2 md:flex">
        <Button asChild variant="ghost" className="h-9 rounded-none border border-white/35 px-3 text-white hover:bg-[#2E7D32]">
          <Link href="/member-access">Member Access</Link>
        </Button>
        <Button asChild className="h-9 rounded-none border border-[#2E7D32] bg-[#2E7D32] px-3 text-white hover:bg-[#1F4D3A]">
          <Link href="/visit">
            Plan Visit
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-none text-white hover:bg-[#2E7D32] md:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[82%] max-w-sm border-l border-[#2E7D32]/45 bg-[#1F4D3A] text-white">
          <SheetHeader className="px-5 pt-8">
            <SheetTitle className="text-white">Liberty Church</SheetTitle>
            <SheetDescription className="text-white/85">Simple navigation and quick access.</SheetDescription>
          </SheetHeader>
          <nav className="grid gap-2 px-5 pb-6">
            <PublicNavLinks active={active} mobile />
            <Button asChild className="mt-3 h-10 rounded-none border border-[#2E7D32] bg-[#2E7D32] text-white hover:bg-[#1F4D3A]">
              <Link href="/visit">
                Plan Visit
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-none border-white/35 bg-transparent text-white hover:bg-[#2E7D32]">
              <Link href="/member-access">Member Access</Link>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </GlobalHeaderBar>
  );
}

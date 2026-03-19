import Link from "next/link";
import { IconArrowLeft, IconMenu2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getDashboardIcon } from "@/components/dashboard/dashboard-icons";
import { GlobalHeaderBar } from "@/components/shared/GlobalHeaderBar";
import { cn } from "@/lib/utils";
import { getMemberProfilePhotoUrl } from "@/lib/member-auth";

function NavItemLink({ item, mobile = false }) {
  const Icon = getDashboardIcon(item.icon);

  if (item.disabled || !item.href) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-3 rounded-none px-3 py-2 text-sm text-[#7f8a97]",
          mobile && "text-base",
        )}
      >
        <Icon size={18} stroke={1.9} />
        <span>{item.label}</span>
      </span>
    );
  }

  const itemClass = cn(
    "inline-flex items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2 text-sm text-[#d4dbe2] transition-colors hover:bg-[#2E7D32]/20 hover:text-white",
    item.active && "border-[#2E7D32] bg-[#2E7D32]/24 text-white",
    mobile && "text-base",
  );

  if (mobile) {
    return (
      <SheetClose asChild>
        <Link href={item.href} className={itemClass}>
          <Icon size={18} stroke={1.9} />
          <span>{item.label}</span>
        </Link>
      </SheetClose>
    );
  }

  return (
    <Link href={item.href} className={itemClass}>
      <Icon size={18} stroke={1.9} />
      <span>{item.label}</span>
    </Link>
  );
}

function UserSummary({ viewer, compact = false }) {
  const member = viewer?.currentMember?.member || null;
  const user = viewer?.currentMember?.user || null;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user || member);
  const name = viewer?.displayName || "Liberty Church Member";
  const email = member?.email || user?.email || "member@golibertychurch.com";

  return (
    <div className={cn("flex items-center gap-3", compact ? "px-0" : "px-1")}>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-none bg-[#2E7D32]">
        {profilePhotoUrl ? (
          <img src={profilePhotoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-white">{String(name).trim().charAt(0).toUpperCase() || "M"}</span>
        )}
      </span>
      <span className="grid min-w-0">
        <strong className="truncate text-sm font-semibold text-white">{name}</strong>
        <span className="truncate text-xs text-white/80">{email}</span>
      </span>
    </div>
  );
}

function MobileMenu({ title, viewer, navItems, currentPath = "" }) {
  const showBackToAdminLink = currentPath !== "/dashboard";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-10 w-10 rounded-none md:hidden" aria-label="Open admin navigation">
          <IconMenu2 size={22} stroke={1.9} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[84%] max-w-sm">
        <SheetHeader className="px-5 pt-6">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Role-aware admin navigation.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 px-5 pb-6">
          <UserSummary viewer={viewer} compact />
          <Separator />
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <NavItemLink key={item.label} item={item} mobile />
            ))}
          </nav>
          <Separator />
          {showBackToAdminLink ? (
            <SheetClose asChild>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-base font-medium text-[#d7dee5] transition-colors hover:bg-[#2E7D32]/20 hover:text-white"
              >
                <IconArrowLeft size={18} stroke={1.9} />
                <span>Back to My Admin</span>
              </Link>
            </SheetClose>
          ) : null}
          <SheetClose asChild>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-base font-medium text-[#d7dee5] transition-colors hover:bg-[#2E7D32]/20 hover:text-white"
            >
              <IconArrowLeft size={18} stroke={1.9} />
              <span>Back to Main Site</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/member"
              className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-base font-medium text-[#d7dee5] transition-colors hover:bg-[#2E7D32]/20 hover:text-white"
            >
              <IconArrowLeft size={18} stroke={1.9} />
              <span>Back to Mobile App</span>
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AdminConsoleShell({ viewer, title, navItems = [], currentPath = "", children }) {
  const showBackToAdminLink = currentPath !== "/dashboard";

  return (
    <div className="min-h-screen bg-[#1a2129] text-[#e9eef3]">
      <GlobalHeaderBar maxWidthClassName="max-w-[1460px]">
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <img src="/assets/lc_logo_new_dark.png" alt="Liberty Church" className="h-8 w-8 rounded-none object-contain" />
          <span className="text-[1.65rem] font-semibold tracking-tight text-white">My Admin</span>
        </Link>

        <div className="hidden md:flex">
          <UserSummary viewer={viewer} />
        </div>

        <MobileMenu title={title} viewer={viewer} navItems={navItems} currentPath={currentPath} />
      </GlobalHeaderBar>

      <div className="mx-auto flex w-full max-w-[1460px]">
        <aside className="hidden w-[250px] border-r border-white/10 bg-[#141b23] md:block">
          <div className="space-y-5 px-4 py-6">
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <NavItemLink key={item.label} item={item} />
              ))}
            </nav>

            <Separator />

            {showBackToAdminLink ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-[#c8d0d8] transition-colors hover:bg-[#2E7D32]/20 hover:text-white"
              >
                <IconArrowLeft size={18} stroke={1.9} />
                <span>Back to My Admin</span>
              </Link>
            ) : null}

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-[#c8d0d8] transition-colors hover:bg-[#2E7D32]/20 hover:text-white"
            >
              <IconArrowLeft size={18} stroke={1.9} />
              <span>Back to Main Site</span>
            </Link>
            <Link
              href="/member"
              className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-[#c8d0d8] transition-colors hover:bg-[#2E7D32]/20 hover:text-white"
            >
              <IconArrowLeft size={18} stroke={1.9} />
              <span>Back to Mobile App</span>
            </Link>
          </div>
        </aside>

        <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

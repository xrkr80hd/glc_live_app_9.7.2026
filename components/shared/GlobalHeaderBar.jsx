"use client";

import { cn } from "@/lib/utils";

export function GlobalHeaderBar({
  children,
  className = "",
  innerClassName = "",
  sticky = true,
  maxWidthClassName = "max-w-6xl",
}) {
  return (
    <header
      className={cn(
        "z-40 border-b border-[#2E7D32]/45 bg-[#1F4D3A] text-white",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8",
          maxWidthClassName,
          innerClassName,
        )}
      >
        {children}
      </div>
    </header>
  );
}

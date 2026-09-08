"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconArrowLeft, IconChevronRight, IconHome } from "@tabler/icons-react";

const LABELS = {
  "/member-access": "Member Access",
  "/member-access/forgot-password": "Forgot Password",
  "/member-access/reset-password": "Reset Password",
};

export function AuthNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLabel = LABELS[pathname] || "Member Access";
  const isRoot = pathname === "/member-access";

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <nav className="lc-auth-nav" aria-label="Member access navigation">
      <div className="lc-auth-nav-inner">
        <button type="button" className="lc-auth-back" onClick={goBack} aria-label="Go back">
          <IconArrowLeft size={18} stroke={2} />
          <span>Back</span>
        </button>

        <div className="lc-auth-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" className="lc-auth-crumb lc-auth-home">
            <IconHome size={17} stroke={2} />
            <span>Home</span>
          </Link>
          <IconChevronRight className="lc-auth-crumb-separator" size={15} stroke={2} aria-hidden="true" />
          {isRoot ? (
            <span className="lc-auth-crumb-current">Member Access</span>
          ) : (
            <>
              <Link href="/member-access" className="lc-auth-crumb">Member Access</Link>
              <IconChevronRight className="lc-auth-crumb-separator" size={15} stroke={2} aria-hidden="true" />
              <span className="lc-auth-crumb-current">{currentLabel}</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

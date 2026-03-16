"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLogout2 } from "@tabler/icons-react";

export function MemberLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/member-auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/member-access");
      router.refresh();
    }
  }

  return (
    <button type="button" className="lc-action-btn ghost" onClick={handleLogout} disabled={isLoggingOut}>
      <IconLogout2 size={18} stroke={1.8} />
      <span>{isLoggingOut ? "Logging Out..." : "Log Out"}</span>
    </button>
  );
}

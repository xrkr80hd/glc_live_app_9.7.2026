"use client";

import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";

export function BackRow({ label = "Back", fallbackHref = "/", useHistory = true, meta = null }) {
  const router = useRouter();

  function handleBack() {
    if (useHistory && typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <div className="lc-back-row">
      <button type="button" className="lc-back-button" onClick={handleBack}>
        <IconChevronLeft size={20} stroke={1.8} />
        <span>{label}</span>
      </button>
      {meta ? <span className="lc-back-meta">{meta}</span> : null}
    </div>
  );
}
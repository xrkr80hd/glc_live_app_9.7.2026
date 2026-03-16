import Image from "next/image";
import Link from "next/link";
import { IconUserCircle } from "@tabler/icons-react";

export function AppHeader({ kicker, title, subtitle, showProfileShortcut = true, headerAction = null }) {
  return (
    <header className="lc-app-header">
      <div className="lc-app-header-top">
        <Link href="/" className="lc-brand-lockup" aria-label="Go to Liberty Church home">
          <Image src="/assets/logo.png" alt="" width={28} height={28} className="lc-brand-mark" />
          <span>Liberty Church</span>
        </Link>
        <div className="lc-app-header-actions">
          {headerAction}
          {showProfileShortcut ? (
            <Link href="/profile" className="lc-profile-shortcut" aria-label="Open profile">
              <IconUserCircle size={24} stroke={1.8} />
            </Link>
          ) : null}
        </div>
      </div>
      {title || subtitle || kicker ? (
        <div className="lc-app-header-copy">
          {kicker ? <p className="lc-app-header-kicker">{kicker}</p> : null}
          {title ? <h1 className="lc-app-header-title">{title}</h1> : null}
          {subtitle ? <p className="lc-app-header-subtitle">{subtitle}</p> : null}
        </div>
      ) : null}
    </header>
  );
}

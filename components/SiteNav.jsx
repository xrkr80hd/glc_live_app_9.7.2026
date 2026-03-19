import Link from "next/link";
import { PUBLIC_NAV_ITEMS } from "@/lib/public-nav";

export function SiteNav() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link href="/" className="brand">
          Liberty Church
        </Link>
        <nav className="nav-links">
          {PUBLIC_NAV_ITEMS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

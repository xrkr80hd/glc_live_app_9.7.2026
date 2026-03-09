import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Watch Live" },
  { href: "/sermons", label: "Sermons" },
  { href: "/youth", label: "Youth" },
  { href: "/give", label: "Give" },
  { href: "/prayer", label: "Prayer" },
  { href: "/visit", label: "Plan a Visit" },
];

export function SiteNav() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link href="/" className="brand">
          Liberty Church
        </Link>
        <nav className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

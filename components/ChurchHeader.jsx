const NAV_ITEMS = [
  { href: "/live", key: "live", label: "Watch Live" },
  { href: "/", key: "home", label: "Home" },
  { href: "/youth", key: "youth", label: "LC Youth" },
  { href: "/beliefs", key: "beliefs", label: "Beliefs" },
  { href: "/sermons", key: "sermons", label: "Sermons" },
  { href: "/prayer", key: "prayer", label: "Prayer" },
  { href: "/give", key: "give", label: "Give" },
];

export function ChurchHeader({ active = "", youthBrand = false }) {
  return (
    <header className="header site-header">
      <div className="container nav">
        {youthBrand ? (
          <a className="brand" href="/">
            <img src="/assets/LC_YOUTH_LOGO.png" alt="LC Youth logo" />
            <span className="brand-title">
              <span className="brand-plain">Liberty Church</span>
              <span className="youth-mark">YOUTH</span>
            </span>
          </a>
        ) : (
          <a className="brand" href="/">
            <img src="/assets/logo.png" alt="Liberty Church logo" />
            <span className="name">Liberty Church</span>
          </a>
        )}

        <button className="nav-toggle" aria-expanded="false" aria-controls="mainNav" type="button">
          <span className="hamburger" aria-hidden="true" />
          <span className="sr-only">Open navigation</span>
        </button>

        <nav id="mainNav">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <a href={item.href} className={active === item.key ? "active" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

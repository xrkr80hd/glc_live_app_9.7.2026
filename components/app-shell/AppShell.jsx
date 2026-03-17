import { AppHeader } from "@/components/app-shell/AppHeader";
import { BottomNav } from "@/components/app-shell/BottomNav";

export function AppShell({
  title,
  subtitle,
  kicker = null,
  theme = "member",
  navKey = "home",
  showProfileShortcut = true,
  headerAction = null,
  compactHeader = true,
  footerContent = null,
  children,
}) {
  const shellClassName = ["lc-app-shell", theme === "youth" ? "theme-youth" : "theme-member"].join(" ");
  const headerVideoUrl =
    theme === "youth"
      ? "https://www.golibertychurch.com/assets/LC_YOUTH_HERO_VID.mp4"
      : navKey === "home"
        ? "https://www.golibertychurch.com/assets/hero_vids/worship_hero.mp4"
        : null;
  const headerLogoSrc = theme === "youth" ? "/assets/LC_YOUTH_LOGO.png" : "/assets/logo.png";
  const headerBrandLabel = theme === "youth" ? "LC Youth" : "Liberty Church";

  return (
    <div className={shellClassName}>
      <div className="lc-app-frame">
        <AppHeader
          kicker={kicker}
          title={title}
          subtitle={subtitle}
          theme={theme}
          showProfileShortcut={showProfileShortcut}
          headerAction={headerAction}
          compactHeader={compactHeader}
          headerVideoUrl={headerVideoUrl}
          headerLogoSrc={headerLogoSrc}
          headerBrandLabel={headerBrandLabel}
        />
        <main className="lc-app-main">{children}</main>
        {footerContent ? <div className="lc-app-footer-slot">{footerContent}</div> : null}
        <BottomNav activeKey={navKey} />
      </div>
    </div>
  );
}

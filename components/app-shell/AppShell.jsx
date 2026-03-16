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
  footerContent = null,
  children,
}) {
  const shellClassName = ["lc-app-shell", theme === "youth" ? "theme-youth" : "theme-member"].join(" ");

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
        />
        <main className="lc-app-main">{children}</main>
        {footerContent ? <div className="lc-app-footer-slot">{footerContent}</div> : null}
        <BottomNav activeKey={navKey} />
      </div>
    </div>
  );
}

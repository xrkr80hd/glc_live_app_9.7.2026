import { AppShell } from "@/components/app-shell/AppShell";
import { BackRow } from "@/components/app-shell/BackRow";
import { MemberAccordion } from "@/components/app-shell/MemberAccordion";
import { SettingsRow } from "@/components/app-shell/SettingsRow";
import { YouthGlassCard } from "@/components/app-shell/YouthGlassCard";
import { DashboardToolCard } from "@/components/dashboard/DashboardToolCard";
import { getDashboardIcon } from "@/components/dashboard/dashboard-icons";

function DashboardHero({ config, viewer }) {
  const content = (
    <>
      <p className="lc-dashboard-eyebrow">{config.label}</p>
      <div className="lc-section-head">
        <h2>{config.heroTitle}</h2>
        <p className="lc-muted">
          {viewer.firstName ? `${viewer.firstName}, ` : ""}
          {config.heroBody}
        </p>
      </div>
      {Array.isArray(config.stats) && config.stats.length ? (
        <div className="lc-dashboard-stat-strip">
          {config.stats.map((stat) => (
            <div key={stat.label} className="lc-dashboard-stat-chip">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  if (config.theme === "youth") {
    return <YouthGlassCard>{content}</YouthGlassCard>;
  }

  return <section className="lc-card alt lc-dashboard-hero">{content}</section>;
}

function DashboardSwitcher({ dashboards, currentPath }) {
  const availableDashboards = dashboards.filter((dashboard) => dashboard.path !== currentPath);
  if (!availableDashboards.length) {
    return null;
  }

  return (
    <section className="lc-card lc-dashboard-switcher-card">
      <div className="lc-section-head">
        <h2>My Dashboards</h2>
        <p className="lc-muted">Switch between the dashboards tied to your current roles.</p>
      </div>
      <div className="lc-dashboard-switcher-grid">
        {availableDashboards.map((dashboard) => (
          <DashboardToolCard
            key={dashboard.key}
            label={dashboard.label}
            description={dashboard.subtitle}
            href={dashboard.path}
            icon={dashboard.theme === "youth" ? "youth" : "grid"}
          />
        ))}
      </div>
    </section>
  );
}

export function RoleDashboardPage({ config, viewer }) {
  const headerSubtitle = config.subtitle;

  return (
    <AppShell
      theme={config.theme}
      navKey={config.navKey}
      title={config.title}
      subtitle={headerSubtitle}
      kicker={config.kicker}
      showProfileShortcut
      compactHeader={false}
    >
      {config.backLink ? <BackRow fallbackHref={config.backLink.href} label={config.backLink.label} useHistory={false} /> : null}

      <DashboardHero config={config} viewer={viewer} />

      <DashboardSwitcher dashboards={viewer.accessibleDashboards} currentPath={config.path} />

      {Array.isArray(config.primaryTools) && config.primaryTools.length ? (
        <section className="lc-stack">
          <div className="lc-section-head">
            <h2>{config.primaryHeading || "Primary Tools"}</h2>
            {config.primaryDescription ? <p className="lc-muted">{config.primaryDescription}</p> : null}
          </div>
          <div className="lc-dashboard-tool-grid">
            {config.primaryTools.map((tool) => (
              <DashboardToolCard
                key={tool.label}
                label={tool.label}
                description={tool.description}
                href={tool.href}
                icon={tool.icon}
                tone={tool.tone}
              />
            ))}
          </div>
        </section>
      ) : null}

      {Array.isArray(config.groups)
        ? config.groups.map((group) => (
            <MemberAccordion key={group.title} title={group.title} description={group.description} defaultOpen={Boolean(group.defaultOpen)}>
              <div className="lc-stack">
                {group.items.map((item) => {
                  const Icon = getDashboardIcon(item.icon);
                  return (
                    <SettingsRow
                      key={item.label}
                      icon={Icon}
                      label={item.label}
                      description={item.description}
                      href={item.href}
                      disabled={Boolean(item.disabled || !item.href)}
                      tone={item.tone || "default"}
                    />
                  );
                })}
              </div>
            </MemberAccordion>
          ))
        : null}

      {config.callout ? (
        <section className="lc-card lc-dashboard-callout">
          <div className="lc-section-head">
            <h2>{config.callout.title}</h2>
          </div>
          <p className="lc-muted">{config.callout.body}</p>
        </section>
      ) : null}
    </AppShell>
  );
}

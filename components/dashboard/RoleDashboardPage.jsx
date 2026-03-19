import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { getDashboardIcon } from "@/components/dashboard/dashboard-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMemberProfilePhotoUrl } from "@/lib/member-auth";

function buildRoleNavItems(config, viewer) {
  const navItems = [
    {
      label: "Dashboard",
      href: config.path,
      icon: "grid",
      active: true,
    },
    {
      label: "Role Access",
      href: "/dashboard/role-access",
      icon: "security",
      active: false,
    },
  ];
  const seen = new Set([config.path, "/dashboard/role-access"]);

  for (const tool of Array.isArray(config.primaryTools) ? config.primaryTools : []) {
    const href = String(tool?.href || "").trim();
    const key = `${tool?.label || ""}-${href || "disabled"}`;
    if (seen.has(key)) {
      continue;
    }

    navItems.push({
      label: tool.label || "Tool",
      href: href || null,
      icon: tool.icon || "grid",
      active: false,
      disabled: !href,
    });
    seen.add(key);
    if (navItems.length >= 8) {
      break;
    }
  }

  if (navItems.length < 8 && Array.isArray(config.groups)) {
    for (const group of config.groups) {
      for (const item of group.items || []) {
        const href = String(item?.href || "").trim();
        const key = `${item?.label || ""}-${href || "disabled"}`;
        if (seen.has(key)) {
          continue;
        }
        navItems.push({
          label: item.label || "Item",
          href: href || null,
          icon: item.icon || "grid",
          active: false,
          disabled: !href,
        });
        seen.add(key);
        if (navItems.length >= 8) {
          break;
        }
      }
      if (navItems.length >= 8) {
        break;
      }
    }
  }

  if (viewer?.accessibleDashboards?.length > 1) {
    navItems.push({
      label: "My Admin Hub",
      href: "/dashboard",
      icon: "settings",
      active: false,
    });
  }

  return navItems;
}

function ProfilePanel({ viewer }) {
  const member = viewer?.currentMember?.member || null;
  const user = viewer?.currentMember?.user || null;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user || member);
  const displayName = viewer?.displayName || "Liberty Church Member";
  const email = member?.email || user?.email || "";

  return (
    <Card className="bg-[#303944] py-0">
      <CardHeader className="px-6 pb-3 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9eadbb]">User</p>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex justify-center">
          <span className="inline-flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#232b34]">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-semibold text-[#d9e1e9]">{displayName?.charAt(0) || "M"}</span>
            )}
          </span>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-[2rem] font-semibold leading-tight text-white">{displayName}</p>
          <p className="text-sm text-[#afbbc7]">{email}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SecondaryInfoPanel({ config, viewer }) {
  const roleKeys = Array.isArray(viewer?.roleKeys) ? viewer.roleKeys : [];
  const tools = Array.isArray(config.primaryTools) ? config.primaryTools : [];
  const otherDashboards = (Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : []).filter(
    (dashboard) => dashboard?.path && dashboard.path !== config.path,
  );

  return (
    <Card className="bg-[#303944] py-0">
      <CardHeader className="px-6 pb-3 pt-6">
        <CardTitle className="text-2xl font-semibold text-white">{config.title}</CardTitle>
        <CardDescription className="text-sm text-[#aab6c2]">
          {config.subtitle || "Role-based tools tied to your current permissions."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {(roleKeys.length ? roleKeys : ["member"]).map((role) => (
            <span key={role} className="rounded-none bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[#d5dde5]">
              {role.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#dce3ea]">Available Actions</p>
          <div className="grid gap-2">
            {tools.length ? (
              tools.map((tool) => {
                const Icon = getDashboardIcon(tool.icon || "grid");
                const hasLink = Boolean(tool.href);

                if (!hasLink) {
                  return (
                    <span key={tool.label} className="inline-flex items-center gap-3 rounded-none bg-white/5 px-4 py-3 text-sm text-[#9ba7b3]">
                      <Icon size={16} stroke={1.9} />
                      <span>{tool.label}</span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={tool.label}
                    href={tool.href}
                    className="inline-flex items-center justify-between rounded-none bg-white/6 px-4 py-3 text-sm text-[#dce3ea] transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon size={16} stroke={1.9} />
                      <span>{tool.label}</span>
                    </span>
                    <IconArrowRight size={16} stroke={1.9} />
                  </Link>
                );
              })
            ) : (
              <span className="rounded-none bg-white/6 px-4 py-3 text-sm text-[#c4ced8]">No actions are configured for this role yet.</span>
            )}
          </div>
        </div>

        {otherDashboards.length ? (
          <>
            <Separator />

            <div className="space-y-2">
              <details className="md:hidden">
                <summary className="cursor-pointer list-none text-sm font-semibold text-[#dce3ea]">
                  <span className="inline-flex w-full items-center justify-between border-b border-white/10 py-2">
                    <span>Also Available</span>
                    <span className="text-xs text-[#aab6c2]">Tap to open</span>
                  </span>
                </summary>
                <ul className="mt-2 grid gap-1">
                  {otherDashboards.map((dashboard) => (
                    <li key={dashboard.key}>
                      <Link
                        href={dashboard.path}
                        className="inline-flex w-full items-center justify-between border-l-2 border-transparent px-2 py-2 text-sm text-[#dce3ea] transition-colors hover:border-[#0f6048] hover:bg-white/6 hover:text-white"
                      >
                        <span>{dashboard.label}</span>
                        <IconArrowRight size={16} stroke={1.9} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="hidden md:block">
                <p className="text-sm font-semibold text-[#dce3ea]">Also Available</p>
                <ul className="mt-2 grid gap-1">
                  {otherDashboards.map((dashboard) => (
                    <li key={dashboard.key}>
                      <Link
                        href={dashboard.path}
                        className="inline-flex w-full items-center justify-between border-l-2 border-transparent px-2 py-2 text-sm text-[#dce3ea] transition-colors hover:border-[#0f6048] hover:bg-white/6 hover:text-white"
                      >
                        <span>{dashboard.label}</span>
                        <IconArrowRight size={16} stroke={1.9} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RoleDashboardPage({ config, viewer }) {
  const navItems = buildRoleNavItems(config, viewer);

  return (
    <AdminConsoleShell viewer={viewer} title={config.title} navItems={navItems} currentPath={config.path}>
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-[#9ca8b4]">{config.label}</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <ProfilePanel viewer={viewer} />
          <SecondaryInfoPanel config={config} viewer={viewer} />
        </div>
      </section>
    </AdminConsoleShell>
  );
}

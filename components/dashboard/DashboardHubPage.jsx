import Link from "next/link";
import { IconArrowRight, IconShieldCheck } from "@tabler/icons-react";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMemberProfilePhotoUrl } from "@/lib/member-auth";

function buildHubNavItems(viewer) {
  const dashboards = Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [];
  const roleKeys = Array.isArray(viewer?.roleKeys) ? viewer.roleKeys : [];
  const showCms = Boolean(viewer?.isSuperuser || roleKeys.includes("pastor"));

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: "grid", active: true },
    { label: "Role Access", href: "/dashboard/role-access", icon: "security", active: false },
    ...dashboards
      .filter((dashboard) => dashboard.path !== "/dashboard")
      .slice(0, 7)
      .map((dashboard) => ({
        label: dashboard.label,
        href: dashboard.path,
        icon: dashboard.theme === "youth" ? "youth" : "grid",
        active: false,
      })),
  ];

  if (showCms) {
    items.push({
      label: "Admin CMS",
      href: "/api/admin/login/member?next=/admin",
      icon: "security",
      active: false,
    });
  }

  return items;
}

function DashboardList({ dashboards }) {
  if (!dashboards.length) {
    return (
      <div className="rounded-none bg-white/6 px-4 py-3 text-sm text-[#c4ced8]">
        Your role dashboards will appear here when role access is available.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {dashboards.map((dashboard) => (
        <Link
          key={dashboard.key}
          href={dashboard.path}
          className="inline-flex items-center justify-between rounded-none bg-white/6 px-4 py-3 text-sm text-[#dce3ea] transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="grid">
            <span className="font-semibold">{dashboard.label}</span>
            <span className="text-xs text-[#a8b3bf]">{dashboard.subtitle || "Open dashboard"}</span>
          </span>
          <IconArrowRight size={16} stroke={1.9} />
        </Link>
      ))}
    </div>
  );
}

export function DashboardHubPage({ viewer }) {
  const navItems = buildHubNavItems(viewer);
  const dashboards = Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [];
  const roleKeys = Array.isArray(viewer?.roleKeys) ? viewer.roleKeys : [];
  const displayRoles = roleKeys.length ? roleKeys : ["member"];
  const member = viewer?.currentMember?.member || null;
  const user = viewer?.currentMember?.user || null;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user || member);

  return (
    <AdminConsoleShell viewer={viewer} title="My Admin" navItems={navItems}>
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-[#9ca8b4]">Role-based access for your Liberty Church admin tools.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="bg-[#303944] py-0">
            <CardHeader className="px-6 pb-3 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9eadbb]">User</p>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="flex justify-center">
                <span className="inline-flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#232b34]">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt={viewer.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-semibold text-[#d9e1e9]">{viewer.displayName?.charAt(0) || "M"}</span>
                  )}
                </span>
              </div>
              <div className="text-center">
                <p className="text-[2rem] font-semibold leading-tight text-white">{viewer.displayName}</p>
                <p className="text-sm text-[#afbbc7]">{member?.email || user?.email || ""}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#303944] py-0">
            <CardHeader className="px-6 pb-3 pt-6">
              <CardTitle className="text-2xl font-semibold text-white">Role Access</CardTitle>
              <CardDescription className="text-sm text-[#aab6c2]">
                Each role unlocks its own admin pages under one login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="flex flex-wrap gap-2">
                {displayRoles.map((role) => (
                  <span key={role} className="rounded-none bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[#d5dde5]">
                    {role.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#dce3ea]">Available Dashboards</p>
                <DashboardList dashboards={dashboards} />
              </div>

              {(viewer?.isSuperuser || roleKeys.includes("pastor")) ? (
                <Link
                  href="/api/admin/login/member?next=/admin"
                  className="inline-flex w-full items-center justify-between rounded-none bg-[#2f8f6b]/20 px-4 py-3 text-sm font-semibold text-[#9ee2c6] transition-colors hover:bg-[#2f8f6b]/30"
                >
                  <span className="inline-flex items-center gap-2">
                    <IconShieldCheck size={16} stroke={1.9} />
                    Admin CMS Access
                  </span>
                  <IconArrowRight size={16} stroke={1.9} />
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminConsoleShell>
  );
}

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function buildRoleAccessNavItems(viewer) {
  const dashboards = Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [];

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: "grid", active: false },
    { label: "Role Access", href: "/dashboard/role-access", icon: "security", active: true },
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

  return items;
}

export function RoleAccessPage({ viewer }) {
  const navItems = buildRoleAccessNavItems(viewer);

  return (
    <AdminConsoleShell viewer={viewer} title="Role Access" navItems={navItems} currentPath="/dashboard/role-access">
      <section className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Role Access</h1>
          <p className="text-sm text-[#9ca8b4]">Separate screen reserved for role-access management.</p>
        </header>

        <Card className="max-w-3xl bg-[#303944] py-0">
          <CardHeader className="px-6 pb-3 pt-6">
            <CardTitle className="text-2xl text-white">Not Populated Yet</CardTitle>
            <CardDescription className="text-sm text-[#aab6c2]">
              This page is intentionally left empty for now and will be wired later.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-none bg-[#0f6048]/18 px-4 py-2 text-sm font-semibold text-[#a5e0c9] transition-colors hover:bg-[#0f6048]/28"
              >
                Back to My Admin
                <IconArrowRight size={16} stroke={1.9} />
              </Link>
              <Link
                href="/member"
                className="inline-flex items-center gap-2 rounded-none bg-white/10 px-4 py-2 text-sm font-semibold text-[#dce3ea] transition-colors hover:bg-white/16"
              >
                Back to Main Site
                <IconArrowRight size={16} stroke={1.9} />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminConsoleShell>
  );
}

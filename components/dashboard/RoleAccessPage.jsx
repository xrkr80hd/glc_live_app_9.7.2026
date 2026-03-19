import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { RoleAccessManager } from "@/components/dashboard/RoleAccessManager";

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
          <p className="text-sm text-[#9ca8b4]">Manage role upgrades for existing members without changing their login.</p>
        </header>
        <RoleAccessManager />
      </section>
    </AdminConsoleShell>
  );
}

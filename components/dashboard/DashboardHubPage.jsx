import Link from "next/link";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { getMemberProfilePhotoUrl } from "@/lib/member-auth";

function buildHubNavItems(viewer) {
  const dashboards = Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [];
  const roleKeys = Array.isArray(viewer?.roleKeys) ? viewer.roleKeys : [];
  const canManage = Boolean(viewer?.isSuperuser || roleKeys.includes("pastor"));

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: "grid", active: true },
    { label: "Chats", href: "/member/chat", icon: "people", active: false },
    ...dashboards
      .filter((dashboard) => dashboard.path !== "/dashboard")
      .slice(0, 8)
      .map((dashboard) => ({
        label: dashboard.label,
        href: dashboard.path,
        icon: dashboard.theme === "youth" ? "youth" : "grid",
        active: false,
      })),
  ];

  if (canManage) {
    items.push({ label: "People & Roles", href: "/api/admin/login/member?next=/admin/people-roles", icon: "security", active: false });
  }

  return items;
}

function prettyRole(role) {
  return String(role || "member")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DashboardHubPage({ viewer }) {
  const navItems = buildHubNavItems(viewer);
  const dashboards = Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [];
  const roleKeys = Array.isArray(viewer?.roleKeys) ? viewer.roleKeys : [];
  const member = viewer?.currentMember?.member || null;
  const user = viewer?.currentMember?.user || null;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user || member);
  const canManage = Boolean(viewer?.isSuperuser || roleKeys.includes("pastor"));

  return (
    <AdminConsoleShell viewer={viewer} title="My Liberty" navItems={navItems}>
      <section className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#9eb0a7]">
          <Link href="/" className="font-semibold text-[#8ee0c2] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-white">Dashboard</span>
        </nav>

        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6ec897]">Liberty Church</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Welcome, {viewer.displayName}</h1>
          <p className="mt-1 text-sm text-[#aab8b0]">Everything available to your account is organized below.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex justify-center">
              <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#203028] text-3xl font-bold text-white">
                {profilePhotoUrl ? <img src={profilePhotoUrl} alt={viewer.displayName} className="h-full w-full object-cover" /> : viewer.displayName?.charAt(0) || "M"}
              </span>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-white">{viewer.displayName}</h2>
              <p className="mt-1 break-all text-xs text-[#aab8b0]">{member?.email || user?.email || ""}</p>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {(roleKeys.length ? roleKeys : ["member"]).map((role) => (
                <span key={role} className="rounded-full border border-[#4f7a65] bg-[#17392a] px-2.5 py-1 text-[11px] font-semibold text-[#bfe5cf]">{prettyRole(role)}</span>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Stay Connected</h2>
                  <p className="mt-1 text-sm text-[#aab8b0]">Church chat and direct messages are available from one place.</p>
                </div>
                <Link href="/member/chat" className="rounded-xl bg-[#2d7a53] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#246343]">Open Chats</Link>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
              <h2 className="text-xl font-bold text-white">My Areas</h2>
              <p className="mt-1 text-sm text-[#aab8b0]">Only the areas connected to your account are shown here.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {dashboards.map((dashboard) => (
                  <Link key={dashboard.key} href={dashboard.path} className="rounded-xl border border-white/10 bg-black/10 p-4 transition hover:border-[#4f8f70] hover:bg-[#17392a]">
                    <strong className="block text-sm text-white">{dashboard.label}</strong>
                    <span className="mt-1 block text-xs leading-5 text-[#aab8b0]">{dashboard.subtitle || "Open this area"}</span>
                  </Link>
                ))}
              </div>
              {!dashboards.length ? <p className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-[#aab8b0]">Your member tools are ready. Additional ministry areas will appear here when they are assigned to you.</p> : null}
            </section>

            {canManage ? (
              <section className="rounded-2xl border border-[#4b8f6d]/40 bg-[#17392a] p-4 sm:p-5">
                <h2 className="text-xl font-bold text-white">Church Management</h2>
                <p className="mt-1 text-sm text-[#b6cfc1]">Manage people, roles, announcements, and other church content.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/api/admin/login/member?next=/admin/people-roles" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#1f6846]">People & Roles</Link>
                  <Link href="/api/admin/login/member?next=/admin/announcements" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-bold text-white">Announcements</Link>
                  <Link href="/api/admin/login/member?next=/admin" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-bold text-white">Master Admin</Link>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </AdminConsoleShell>
  );
}

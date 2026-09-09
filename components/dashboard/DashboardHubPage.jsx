import Link from "next/link";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { getMemberProfilePhotoUrl } from "@/lib/member-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMemberRoles, normalizeRoleKeyForPolicy } from "@/lib/admin-role-access";

const STANDARD_ROLE_KEYS = new Set([
  "superuser",
  "pastor",
  "associate_pastor",
  "bookkeeper",
  "youth_minister",
  "youth_minister_assistant",
  "worship_leader",
  "worship_team",
  "media_team",
  "foh_sound",
  "kids_church",
  "church_member",
]);

function buildHubNavItems(viewer, customRoles) {
  const dashboards = Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [];
  const roleKeys = Array.isArray(viewer?.roleKeys) ? viewer.roleKeys : [];
  const canManage = Boolean(viewer?.isSuperuser || roleKeys.includes("pastor"));
  const items = [
    { label: "Dashboard", href: "/dashboard", icon: "grid", active: true },
    { label: "Chats", href: "/member/chat", icon: "people", active: false },
    ...dashboards.filter((dashboard) => dashboard.path !== "/dashboard").slice(0, 6).map((dashboard) => ({
      label: dashboard.label,
      href: dashboard.path,
      icon: dashboard.theme === "youth" ? "youth" : "grid",
      active: false,
    })),
    ...customRoles.slice(0, 3).map((role) => ({
      label: role.name,
      href: `/dashboard/ministry/${role.role_key}`,
      icon: "people",
      active: false,
    })),
  ];
  if (canManage) items.push({ label: "People & Roles", href: "/api/admin/login/member?next=/admin/people-roles", icon: "security", active: false });
  return items;
}

function prettyRole(role) {
  return String(role || "member").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function DashboardHubPage({ viewer }) {
  const dashboards = Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [];
  const roleKeys = Array.isArray(viewer?.roleKeys) ? viewer.roleKeys : [];
  const member = viewer?.currentMember?.member || null;
  const user = viewer?.currentMember?.user || null;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user || member);
  const canManage = Boolean(viewer?.isSuperuser || roleKeys.includes("pastor"));

  let assignedRoles = [];
  const db = createSupabaseAdminClient();
  if (db && member?.id) assignedRoles = await getMemberRoles(db, member.id);
  const customRoles = assignedRoles.filter((role) => !STANDARD_ROLE_KEYS.has(normalizeRoleKeyForPolicy(role.role_key)));
  const navItems = buildHubNavItems(viewer, customRoles);

  const strongCard = "border-2 border-black bg-[#0b4f2a] p-4 sm:p-5";
  const strongLink = "inline-flex min-h-12 items-center justify-center border-2 border-black bg-white px-4 py-2.5 text-sm font-black text-black hover:bg-[#178b43] hover:text-white";

  return (
    <AdminConsoleShell viewer={viewer} title="My Liberty" navItems={navItems}>
      <section className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
          <Link href="/" className="font-black text-white hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-black text-white">Dashboard</span>
        </nav>

        <header>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white">Liberty Church</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Welcome, {viewer.displayName}</h1>
          <p className="mt-1 text-sm font-semibold text-white">Everything available to your account is organized below.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className={strongCard}>
            <div className="flex justify-center">
              <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#178b43] text-3xl font-black text-white">
                {profilePhotoUrl ? <img src={profilePhotoUrl} alt={viewer.displayName} className="h-full w-full object-cover" /> : viewer.displayName?.charAt(0) || "M"}
              </span>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-black text-white">{viewer.displayName}</h2>
              <p className="mt-1 break-all text-xs font-semibold text-white">{member?.email || user?.email || ""}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {(assignedRoles.length ? assignedRoles.map((role) => role.name) : (roleKeys.length ? roleKeys.map(prettyRole) : ["Member"])).map((roleLabel) => (
                <span key={roleLabel} className="border-2 border-white bg-[#178b43] px-3 py-2 text-center text-xs font-black text-white">{roleLabel}</span>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <section className={strongCard}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Stay Connected</h2>
                  <p className="mt-1 text-sm font-semibold text-white">Main Chat, ministry rooms, and direct messages are all in one place.</p>
                </div>
                <Link href="/member/chat" className={strongLink}>Open Chats</Link>
              </div>
            </section>

            <section className={strongCard}>
              <h2 className="text-xl font-black text-white">My Areas</h2>
              <p className="mt-1 text-sm font-semibold text-white">Only areas connected to your account are shown.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {dashboards.map((dashboard) => (
                  <Link key={dashboard.key} href={dashboard.path} className="border-2 border-white bg-[#178b43] p-4 text-white hover:bg-white hover:text-black">
                    <strong className="block text-sm font-black">{dashboard.label}</strong>
                    <span className="mt-1 block text-xs font-semibold leading-5">{dashboard.subtitle || "Open this area"}</span>
                  </Link>
                ))}
                {customRoles.map((role) => (
                  <Link key={role.id} href={`/dashboard/ministry/${role.role_key}`} className="border-2 border-white bg-[#178b43] p-4 text-white hover:bg-white hover:text-black">
                    <strong className="block text-sm font-black">{role.name}</strong>
                    <span className="mt-1 block text-xs font-semibold leading-5">Custom ministry dashboard and private ministry chat.</span>
                  </Link>
                ))}
              </div>
            </section>

            {canManage ? (
              <section className={strongCard}>
                <h2 className="text-xl font-black text-white">Church Management</h2>
                <p className="mt-1 text-sm font-semibold text-white">Manage people, roles, announcements, and church content.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Link href="/api/admin/login/member?next=/admin/people-roles" className={strongLink}>People & Roles</Link>
                  <Link href="/api/admin/login/member?next=/admin/announcements" className={strongLink}>Announcements</Link>
                  <Link href="/api/admin/login/member?next=/admin" className={strongLink}>Master Admin</Link>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </AdminConsoleShell>
  );
}

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
    ...dashboards.filter((dashboard) => dashboard.path !== "/dashboard").slice(0, 6).map((dashboard) => ({
      label: dashboard.label,
      href: dashboard.path,
      icon: dashboard.theme === "youth" ? "youth" : "grid",
      active: false,
    })),
  ];
  if (roleKeys.includes("media_team") || roleKeys.includes("pastor") || viewer?.isSuperuser) {
    items.push({ label: "Media Chat · Coming Soon", href: "/member/chat", icon: "people", active: false });
  }
  for (const role of customRoles.slice(0, 3)) {
    items.push({ label: role.name, href: `/dashboard/ministry/${role.role_key}`, icon: "people", active: false });
  }
  if (canManage) items.push({ label: "People & Roles", href: "/api/admin/login/member?next=/admin/people-roles", icon: "security", active: false });
  return items;
}

function prettyRole(role) {
  return String(role || "member").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function areaGroup(dashboard) {
  const key = String(dashboard?.key || "");
  if (["media", "foh", "worship", "musicMinister"].includes(key)) return "Service & Production";
  if (["pastor", "superuser", "bookkeeper"].includes(key)) return "Leadership & Administration";
  if (["youth", "youthAssistant", "kids"].includes(key)) return "Youth & Family";
  return "Member & General";
}

function GroupedAreas({ dashboards, customRoles }) {
  const groups = dashboards.reduce((map, dashboard) => {
    const label = areaGroup(dashboard);
    if (!map[label]) map[label] = [];
    map[label].push({ ...dashboard, href: dashboard.path });
    return map;
  }, {});

  if (customRoles.length) {
    groups["Other Ministries"] = customRoles.map((role) => ({
      key: role.id,
      label: role.name,
      href: `/dashboard/ministry/${role.role_key}`,
    }));
  }

  return (
    <div className="space-y-2">
      {Object.entries(groups).map(([label, items]) => (
        <details key={label} className="border border-white/10 bg-[#141b23]" open={label === "Service & Production"}>
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-white">{label} <span className="ml-2 text-xs font-medium text-[#8f9ca8]">({items.length})</span></summary>
          <div className="grid gap-2 border-t border-white/10 p-3 sm:grid-cols-2">
            {items.map((item) => (
              <Link key={item.key} href={item.href} className="border border-white/10 bg-[#1a2129] px-4 py-3 text-sm font-semibold text-white hover:border-[#4f8f70] hover:bg-[#17392a]">
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
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

  return (
    <AdminConsoleShell viewer={viewer} title="My Liberty" navItems={navItems} currentPath="/dashboard">
      <section className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#9eb0a7]">
          <Link href="/" className="font-semibold text-[#8ee0c2] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-white">Dashboard</span>
        </nav>

        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6ec897]">Liberty Church</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Welcome, {viewer.displayName}</h1>
          <p className="mt-1 text-sm text-[#aab8b0]">Open one group at a time so your ministry areas stay organized and easy to scan.</p>
        </header>

        <details open className="border border-white/10 bg-white/[0.04]">
          <summary className="cursor-pointer list-none px-4 py-4 text-lg font-bold text-white">My Ministry Areas</summary>
          <div className="border-t border-white/10 p-4">
            <GroupedAreas dashboards={dashboards} customRoles={customRoles} />
          </div>
        </details>

        {(roleKeys.includes("media_team") || roleKeys.includes("pastor") || viewer?.isSuperuser) ? (
          <details className="border border-white/10 bg-white/[0.04]">
            <summary className="cursor-pointer list-none px-4 py-4 text-lg font-bold text-white">Service Communication</summary>
            <div className="border-t border-white/10 p-4">
              <div className="border border-white/10 bg-[#141b23] p-4">
                <h2 className="text-base font-bold text-white">Media Chat</h2>
                <p className="mt-1 text-sm leading-6 text-[#aab8b0]">The previous chat has been removed. The replacement will be a focused service room plus direct messages.</p>
                <Link href="/member/chat" className="mt-4 inline-flex min-h-11 items-center border border-[#4f8f70] bg-[#17392a] px-4 text-sm font-bold text-white hover:bg-[#1d4934]">View placeholder</Link>
              </div>
            </div>
          </details>
        ) : null}

        {canManage ? (
          <details className="border border-white/10 bg-white/[0.04]">
            <summary className="cursor-pointer list-none px-4 py-4 text-lg font-bold text-white">Church Management</summary>
            <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-3">
              <Link href="/api/admin/login/member?next=/admin/people-roles" className="inline-flex min-h-12 items-center justify-center border-2 border-black bg-white px-4 text-sm font-black text-black hover:bg-[#e9f2ed]">People & Roles</Link>
              <Link href="/api/admin/login/member?next=/admin/announcements" className="inline-flex min-h-12 items-center justify-center border-2 border-black bg-[#1d4c38] px-4 text-sm font-black text-white hover:bg-[#17392a]">Announcements</Link>
              <Link href="/api/admin/login/member?next=/admin" className="inline-flex min-h-12 items-center justify-center border-2 border-black bg-[#1d4c38] px-4 text-sm font-black text-white hover:bg-[#17392a]">Master Admin</Link>
            </div>
          </details>
        ) : null}

        <details className="border border-white/10 bg-white/[0.04]">
          <summary className="cursor-pointer list-none px-4 py-4 text-lg font-bold text-white">My Account & Roles</summary>
          <div className="flex flex-col gap-4 border-t border-white/10 p-4 sm:flex-row sm:items-center">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#203028] text-xl font-bold text-white">
              {profilePhotoUrl ? <img src={profilePhotoUrl} alt={viewer.displayName} className="h-full w-full object-cover" /> : viewer.displayName?.charAt(0) || "M"}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white">{viewer.displayName}</h2>
              <p className="mt-1 break-all text-xs text-[#aab8b0]">{member?.email || user?.email || ""}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(assignedRoles.length ? assignedRoles.map((role) => role.name) : (roleKeys.length ? roleKeys.map(prettyRole) : ["Member"])).map((roleLabel) => (
                  <span key={roleLabel} className="border border-[#4f7a65] bg-[#17392a] px-2.5 py-1 text-[11px] font-semibold text-[#bfe5cf]">{roleLabel}</span>
                ))}
              </div>
            </div>
          </div>
        </details>
      </section>
    </AdminConsoleShell>
  );
}

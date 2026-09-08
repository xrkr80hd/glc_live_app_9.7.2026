import Link from "next/link";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { getDashboardIcon } from "@/components/dashboard/dashboard-icons";
import { getMemberProfilePhotoUrl } from "@/lib/member-auth";

const SERVICE_PLAN_DASHBOARD_KEYS = new Set(["worship", "musicMinister", "media", "foh", "pastor", "superuser"]);

function prettyRole(role) {
  return String(role || "member")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildRoleNavItems(config, viewer) {
  const navItems = [
    { label: "My Dashboard", href: "/dashboard", icon: "grid", active: false },
    { label: config.label, href: config.path, icon: config.theme === "youth" ? "youth" : "grid", active: true },
    { label: "Chats", href: "/member/chat", icon: "people", active: false },
  ];

  if (SERVICE_PLAN_DASHBOARD_KEYS.has(config.key)) {
    navItems.push({ label: "Service Plan", href: "/dashboard/services", icon: "planning", active: false });
  }

  const realLinks = [
    ...(Array.isArray(config.primaryTools) ? config.primaryTools : []),
    ...(Array.isArray(config.groups) ? config.groups.flatMap((group) => group.items || []) : []),
  ].filter((item) => String(item?.href || "").trim());

  const seen = new Set(navItems.map((item) => item.href));
  for (const item of realLinks) {
    const href = String(item.href).trim();
    if (!href || seen.has(href)) continue;
    navItems.push({ label: item.label || "Tool", href, icon: item.icon || "grid", active: false });
    seen.add(href);
    if (navItems.length >= 8) break;
  }

  return navItems;
}

function ProfileCard({ viewer }) {
  const member = viewer?.currentMember?.member || null;
  const user = viewer?.currentMember?.user || null;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user || member);
  const displayName = viewer?.displayName || "Liberty Church Member";
  const email = member?.email || user?.email || "";

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <div className="flex justify-center">
        <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#203028] text-3xl font-bold text-white">
          {profilePhotoUrl ? <img src={profilePhotoUrl} alt={displayName} className="h-full w-full object-cover" /> : displayName.charAt(0)}
        </span>
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-bold text-white">{displayName}</h2>
        <p className="mt-1 break-all text-xs text-[#aab8b0]">{email}</p>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(viewer?.roleKeys?.length ? viewer.roleKeys : ["member"]).map((role) => (
          <span key={role} className="rounded-full border border-[#4f7a65] bg-[#17392a] px-2.5 py-1 text-[11px] font-semibold text-[#bfe5cf]">{prettyRole(role)}</span>
        ))}
      </div>
    </aside>
  );
}

function RoleTools({ config, viewer }) {
  const tools = (Array.isArray(config.primaryTools) ? config.primaryTools : []).filter((tool) => String(tool?.href || "").trim());
  const groupItems = (Array.isArray(config.groups) ? config.groups : [])
    .flatMap((group) => (group.items || []).map((item) => ({ ...item, groupTitle: group.title })))
    .filter((item) => String(item?.href || "").trim());
  const allTools = [...tools, ...groupItems];
  const otherDashboards = (Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [])
    .filter((dashboard) => dashboard?.path && dashboard.path !== config.path);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
        <h2 className="text-xl font-bold text-white">{config.label}</h2>
        <p className="mt-1 text-sm leading-6 text-[#aab8b0]">{config.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/member/chat" className="rounded-xl bg-[#2d7a53] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#246343]">Open Ministry Chats</Link>
          {SERVICE_PLAN_DASHBOARD_KEYS.has(config.key) ? (
            <Link href="/dashboard/services" className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">Service Plan</Link>
          ) : null}
        </div>
      </section>

      {allTools.length ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <h2 className="text-lg font-bold text-white">Available Tools</h2>
          <p className="mt-1 text-sm text-[#aab8b0]">Only working destinations are shown here.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {allTools.map((tool) => {
              const Icon = getDashboardIcon(tool.icon || "grid");
              return (
                <Link key={`${tool.label}-${tool.href}`} href={tool.href} className="rounded-xl border border-white/10 bg-black/10 p-4 transition hover:border-[#4f8f70] hover:bg-[#17392a]">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#204331] text-[#8ee0c2]"><Icon size={18} stroke={1.9} /></span>
                    <span>
                      <strong className="block text-sm text-white">{tool.label}</strong>
                      {tool.description ? <span className="mt-1 block text-xs leading-5 text-[#aab8b0]">{tool.description}</span> : null}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <h2 className="text-lg font-bold text-white">Ministry Access</h2>
          <p className="mt-1 text-sm leading-6 text-[#aab8b0]">Your role is active. Ministry chat is available now. Additional tools will appear here only after they are fully connected.</p>
        </section>
      )}

      {otherDashboards.length ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <h2 className="text-lg font-bold text-white">My Other Areas</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {otherDashboards.map((dashboard) => (
              <Link key={dashboard.key} href={dashboard.path} className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm font-semibold text-white hover:border-[#4f8f70] hover:bg-[#17392a]">
                {dashboard.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function RoleDashboardPage({ config, viewer }) {
  const navItems = buildRoleNavItems(config, viewer);

  return (
    <AdminConsoleShell viewer={viewer} title={config.title} navItems={navItems} currentPath={config.path}>
      <section className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#9eb0a7]">
          <Link href="/" className="font-semibold text-[#8ee0c2] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="font-semibold text-[#8ee0c2] hover:underline">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-white">{config.label}</span>
        </nav>

        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6ec897]">{config.kicker || "Ministry"}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{config.title}</h1>
          <p className="mt-1 text-sm text-[#aab8b0]">{config.subtitle}</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <ProfileCard viewer={viewer} />
          <RoleTools config={config} viewer={viewer} />
        </div>
      </section>
    </AdminConsoleShell>
  );
}

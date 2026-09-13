import Link from "next/link";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { getDashboardIcon } from "@/components/dashboard/dashboard-icons";
import { getMemberProfilePhotoUrl } from "@/lib/member-auth";

const SERVICE_PLAN_DASHBOARD_KEYS = new Set(["worship", "musicMinister", "media", "foh", "pastor", "superuser"]);
const REQUEST_DASHBOARD_KEYS = new Set(["musicMinister", "media", "foh", "youth", "youthAssistant", "kids", "pastor", "superuser"]);

function prettyRole(role) {
  return String(role || "member")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildRoleNavItems(config, viewer) {
  const navItems = [
    { label: "My Dashboard", href: "/dashboard", icon: "grid", active: false },
    { label: config.label, href: config.path, icon: config.theme === "youth" ? "youth" : "grid", active: true },
  ];

  if (SERVICE_PLAN_DASHBOARD_KEYS.has(config.key)) {
    navItems.push({ label: "Service Plan", href: "/dashboard/services", icon: "planning", active: false });
  }
  if (REQUEST_DASHBOARD_KEYS.has(config.key)) {
    navItems.push({ label: "Ministry Requests", href: "/member/requests", icon: "finance", active: false });
  }
  if (config.key === "media") {
    navItems.push({ label: "Media Chat · Coming Soon", href: "/member/chat", icon: "people", active: false });
  }

  return navItems;
}

function WorkingToolLink({ tool }) {
  const Icon = getDashboardIcon(tool.icon || "grid");
  return (
    <Link href={tool.href} className="block border border-white/10 bg-[#141b23] p-4 transition hover:border-[#4f8f70] hover:bg-[#17392a]">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center bg-[#204331] text-[#8ee0c2]"><Icon size={18} stroke={1.9} /></span>
        <span className="min-w-0">
          <strong className="block text-sm text-white">{tool.label}</strong>
          {tool.description ? <span className="mt-1 block text-xs leading-5 text-[#aab8b0]">{tool.description}</span> : null}
        </span>
      </div>
    </Link>
  );
}

function areaGroup(dashboard) {
  const key = String(dashboard?.key || "");
  if (["media", "foh", "worship", "musicMinister"].includes(key)) return "Service & Production";
  if (["pastor", "superuser", "bookkeeper"].includes(key)) return "Leadership & Administration";
  if (["youth", "youthAssistant", "kids"].includes(key)) return "Youth & Family";
  return "Member & General";
}

function GroupedOtherAreas({ dashboards }) {
  const groups = dashboards.reduce((map, dashboard) => {
    const label = areaGroup(dashboard);
    if (!map[label]) map[label] = [];
    map[label].push(dashboard);
    return map;
  }, {});

  return (
    <div className="space-y-2">
      {Object.entries(groups).map(([label, items]) => (
        <details key={label} className="border border-white/10 bg-[#141b23]">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-white">{label} <span className="ml-2 text-xs font-medium text-[#8f9ca8]">({items.length})</span></summary>
          <div className="grid gap-2 border-t border-white/10 p-3 sm:grid-cols-2">
            {items.map((dashboard) => (
              <Link key={dashboard.key} href={dashboard.path} className="border border-white/10 bg-[#1a2129] px-4 py-3 text-sm font-semibold text-white hover:border-[#4f8f70] hover:bg-[#17392a]">
                {dashboard.label}
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function AccountRoles({ viewer }) {
  const member = viewer?.currentMember?.member || null;
  const user = viewer?.currentMember?.user || null;
  const profilePhotoUrl = getMemberProfilePhotoUrl(user || member);
  const displayName = viewer?.displayName || "Liberty Church Member";
  const email = member?.email || user?.email || "";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#203028] text-xl font-bold text-white">
        {profilePhotoUrl ? <img src={profilePhotoUrl} alt={displayName} className="h-full w-full object-cover" /> : displayName.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-white">{displayName}</h3>
        <p className="mt-1 break-all text-xs text-[#aab8b0]">{email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(viewer?.roleKeys?.length ? viewer.roleKeys : ["member"]).map((role) => (
            <span key={role} className="border border-[#4f7a65] bg-[#17392a] px-2.5 py-1 text-[11px] font-semibold text-[#bfe5cf]">{prettyRole(role)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleTools({ config, viewer }) {
  const configTools = [
    ...(Array.isArray(config.primaryTools) ? config.primaryTools : []),
    ...(Array.isArray(config.groups) ? config.groups.flatMap((group) => group.items || []) : []),
  ].filter((item) => String(item?.href || "").trim());

  const systemTools = [];
  if (SERVICE_PLAN_DASHBOARD_KEYS.has(config.key)) {
    systemTools.push({ label: "Service Plan", description: "Open the shared service order, cues, and ministry coordination workspace.", href: "/dashboard/services", icon: "planning" });
  }
  if (REQUEST_DASHBOARD_KEYS.has(config.key)) {
    systemTools.push({ label: "Ministry Requests", description: "Submit and review ministry needs through the existing request flow.", href: "/member/requests", icon: "finance" });
  }
  if (config.key === "media") {
    systemTools.push({ label: "Media Chat", description: "The old chat has been removed. A focused service chat will return here.", href: "/member/chat", icon: "people" });
  }

  const seen = new Set();
  const allTools = [...systemTools, ...configTools].filter((tool) => {
    if (!tool.href || seen.has(tool.href)) return false;
    seen.add(tool.href);
    return true;
  });

  const otherDashboards = (Array.isArray(viewer?.accessibleDashboards) ? viewer.accessibleDashboards : [])
    .filter((dashboard) => dashboard?.path && dashboard.path !== config.path);

  return (
    <div className="space-y-3">
      <details open className="border border-white/10 bg-white/[0.04]">
        <summary className="cursor-pointer list-none px-4 py-4 text-lg font-bold text-white">{config.key === "media" ? "Media Team Workspace" : `${config.label} Workspace`}</summary>
        <div className="border-t border-white/10 p-4">
          <p className="mb-4 text-sm leading-6 text-[#aab8b0]">{config.subtitle}</p>
          {allTools.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {allTools.map((tool) => <WorkingToolLink key={`${tool.label}-${tool.href}`} tool={tool} />)}
            </div>
          ) : (
            <p className="text-sm text-[#aab8b0]">No additional working tools are connected to this role yet.</p>
          )}
        </div>
      </details>

      {otherDashboards.length ? (
        <details className="border border-white/10 bg-white/[0.04]">
          <summary className="cursor-pointer list-none px-4 py-4 text-lg font-bold text-white">My Other Areas</summary>
          <div className="border-t border-white/10 p-4">
            <GroupedOtherAreas dashboards={otherDashboards} />
          </div>
        </details>
      ) : null}

      <details className="border border-white/10 bg-white/[0.04]">
        <summary className="cursor-pointer list-none px-4 py-4 text-lg font-bold text-white">My Account & Roles</summary>
        <div className="border-t border-white/10 p-4"><AccountRoles viewer={viewer} /></div>
      </details>
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

        <RoleTools config={config} viewer={viewer} />
      </section>
    </AdminConsoleShell>
  );
}

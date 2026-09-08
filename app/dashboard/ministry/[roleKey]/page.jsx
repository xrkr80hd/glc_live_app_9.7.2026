import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminConsoleShell } from "@/components/dashboard/AdminConsoleShell";
import { getDashboardViewerContext, normalizeDashboardRoleKey } from "@/lib/role-dashboard-config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function pretty(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function CustomMinistryDashboardPage({ params }) {
  const { roleKey: rawRoleKey } = await params;
  const roleKey = normalizeDashboardRoleKey(rawRoleKey);
  const viewer = await getDashboardViewerContext();
  if (!viewer) redirect("/member-access");

  const allowed = viewer.isSuperuser || viewer.roleKeys.includes("pastor") || viewer.roleKeys.includes(roleKey);
  if (!allowed) redirect("/dashboard");

  const db = createSupabaseAdminClient();
  if (!db) notFound();

  const { data: role } = await db
    .from("team_roles")
    .select("id,role_key,name,description,is_system,is_active")
    .eq("role_key", roleKey)
    .eq("is_active", true)
    .maybeSingle();
  if (!role) notFound();

  const { data: grants } = await db
    .from("role_permissions")
    .select("permission_id,permissions(permission_key,name,description,module_key)")
    .eq("role_id", role.id);
  const permissions = (grants || []).map((row) => row.permissions).filter(Boolean);

  const navItems = [
    { label: "My Dashboard", href: "/dashboard", icon: "grid", active: false },
    { label: role.name, href: `/dashboard/ministry/${role.role_key}`, icon: "people", active: true },
    { label: "Chats", href: "/member/chat", icon: "people", active: false },
  ];

  return (
    <AdminConsoleShell viewer={viewer} title={role.name} navItems={navItems} currentPath={`/dashboard/ministry/${role.role_key}`}>
      <section className="space-y-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#9eb0a7]">
          <Link href="/" className="font-semibold text-[#8ee0c2] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="font-semibold text-[#8ee0c2] hover:underline">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-white">{role.name}</span>
        </nav>

        <header>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6ec897]">Ministry</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{role.name}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#aab8b0]">{role.description || `Private tools and communication for ${role.name}.`}</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
            <h2 className="text-xl font-bold text-white">Ministry Tools</h2>
            <p className="mt-1 text-sm text-[#aab8b0]">Only permissions actually granted to this ministry are listed.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {permissions.map((permission) => (
                <div key={permission.permission_key} className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#72c99a]">{pretty(permission.module_key || "Access")}</p>
                  <strong className="mt-1 block text-sm text-white">{permission.name}</strong>
                  {permission.description ? <p className="mt-1 text-xs leading-5 text-[#aab8b0]">{permission.description}</p> : null}
                </div>
              ))}
              {!permissions.length ? (
                <p className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-[#aab8b0]">No additional management permissions have been granted yet.</p>
              ) : null}
            </div>
          </section>

          <aside className="space-y-3">
            <section className="rounded-2xl border border-[#4b8f6d]/40 bg-[#17392a] p-4">
              <h2 className="text-lg font-bold text-white">Ministry Chat</h2>
              <p className="mt-1 text-sm leading-5 text-[#b6cfc1]">Talk with everyone assigned to this ministry.</p>
              <Link href="/member/chat" className="mt-4 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#1f6846]">Open Chat</Link>
            </section>
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <h2 className="text-sm font-bold text-white">Access</h2>
              <p className="mt-1 text-xs leading-5 text-[#aab8b0]">Your access comes from the <strong className="text-white">{role.name}</strong> role. If this assignment changes, this ministry area updates with it.</p>
            </section>
          </aside>
        </div>
      </section>
    </AdminConsoleShell>
  );
}

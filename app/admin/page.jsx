import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMemberRoles } from "@/lib/admin-role-access";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) redirect("/admin/login");

  let roles = [];
  if (session.memberId) {
    const supabase = createSupabaseAdminClient();
    if (supabase) roles = await getMemberRoles(supabase, session.memberId);
  }

  return (
    <>
      <div className="bg-[#172034] px-4 py-3 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">Master Admin</p>
            <p className="text-sm text-white/75">Manage the public church app and Sunday operations from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/people-roles" className="inline-flex h-10 items-center border border-[#8ee0c2]/50 bg-[#0f6048] px-4 text-sm font-semibold text-white hover:bg-[#12755a]">People & Roles</Link>
            <Link href="/admin/announcements" className="inline-flex h-10 items-center border border-[#8ee0c2]/50 bg-[#0f6048] px-4 text-sm font-semibold text-white hover:bg-[#12755a]">Announcements</Link>
            <Link href="/admin/homepage" className="inline-flex h-10 items-center border border-[#8ee0c2]/50 bg-[#0f6048] px-4 text-sm font-semibold text-white hover:bg-[#12755a]">Homepage Content</Link>
            <Link href="/admin/service-planning" className="inline-flex h-10 items-center border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/8">Service Planner</Link>
            <Link href="/admin/service-team" className="inline-flex h-10 items-center border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/8">Service Team</Link>
            <Link href="/admin/media-readiness" className="inline-flex h-10 items-center border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/8">Media Readiness</Link>
          </div>
        </div>
      </div>
      <AdminDashboard
        username={session.username}
        sessionInfo={{
          memberId: session.memberId || null,
          isSuperuser: Boolean(session.isSuperuser),
          roleKeys: roles.map((role) => String(role.role_key || "").trim().toLowerCase()).filter(Boolean),
        }}
      />
    </>
  );
}

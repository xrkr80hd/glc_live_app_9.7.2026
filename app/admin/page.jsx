import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMemberRoles } from "@/lib/admin-role-access";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) {
    redirect("/admin/login");
  }

  let roles = [];
  if (session.memberId) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      roles = await getMemberRoles(supabase, session.memberId);
    }
  }

  return (
    <AdminDashboard
      username={session.username}
      sessionInfo={{
        memberId: session.memberId || null,
        isSuperuser: Boolean(session.isSuperuser),
        roleKeys: roles
          .map((role) => String(role.role_key || "").trim().toLowerCase())
          .filter(Boolean),
      }}
    />
  );
}

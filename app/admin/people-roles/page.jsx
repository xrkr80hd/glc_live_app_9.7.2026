import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { PeopleRolesManager } from "@/components/admin/PeopleRolesManager";

export const dynamic = "force-dynamic";

export default async function PeopleRolesPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) redirect("/admin/login");

  return (
    <main>
      <div className="lc-admin-page">
        <div className="lc-admin-page-head">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em]">Master Admin</p>
            <h1 className="mt-1 text-3xl font-bold">People & Roles</h1>
            <p className="mt-1 text-sm">Manage member access, ministry roles, leaders, and permissions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin">Back to Admin</Link>
            <Link href="/dashboard">View Dashboard</Link>
          </div>
        </div>

        <details open className="lc-admin-page-accordion">
          <summary>People & Roles Management</summary>
          <div className="p-3 sm:p-4">
            <PeopleRolesManager />
          </div>
        </details>
      </div>
    </main>
  );
}

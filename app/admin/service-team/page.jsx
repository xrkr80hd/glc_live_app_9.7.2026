import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { ServiceTeamClient } from "@/components/admin/ServiceTeamClient";

export const dynamic = "force-dynamic";

export default async function ServiceTeamAdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) redirect("/admin/login");

  return (
    <main>
      <div className="lc-admin-page">
        <div className="lc-admin-page-head">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em]">Master Admin</p><h1 className="text-3xl font-bold">Service Team</h1></div>
        </div>
        <details open className="lc-admin-page-accordion">
          <summary>Service Team Workspace</summary>
          <div className="p-3 sm:p-4"><ServiceTeamClient /></div>
        </details>
      </div>
    </main>
  );
}

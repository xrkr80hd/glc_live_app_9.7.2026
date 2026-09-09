import { redirect } from "next/navigation";
import { MediaReadinessSetupClient } from "@/components/admin/MediaReadinessSetupClient";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function MediaReadinessAdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) redirect("/admin/login");

  return (
    <main>
      <div className="lc-admin-page">
        <div className="lc-admin-page-head">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em]">Master Admin</p><h1 className="text-3xl font-bold">Media Readiness</h1></div>
        </div>
        <details open className="lc-admin-page-accordion">
          <summary>Media Readiness Workspace</summary>
          <div className="p-3 sm:p-4"><MediaReadinessSetupClient /></div>
        </details>
      </div>
    </main>
  );
}

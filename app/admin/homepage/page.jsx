import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { HomepageContentManager } from "@/components/admin/HomepageContentManager";

export const dynamic = "force-dynamic";

export default async function AdminHomepageEditorPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) redirect("/admin/login");

  return (
    <main>
      <div className="lc-admin-page">
        <div className="lc-admin-page-head">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em]">Master Admin</p>
            <h1 className="mt-1 text-3xl font-bold">Homepage Content</h1>
            <p className="mt-1 text-sm">Edit the hero, pastor section, and homepage call-to-action.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin">Back to Admin</Link>
            <Link href="/">View Homepage</Link>
          </div>
        </div>

        <details open className="lc-admin-page-accordion">
          <summary>Homepage Sections</summary>
          <div className="p-3 sm:p-4">
            <HomepageContentManager />
          </div>
        </details>
      </div>
    </main>
  );
}

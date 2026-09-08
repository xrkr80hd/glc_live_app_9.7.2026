import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { HomepageContentManager } from "@/components/admin/HomepageContentManager";

export const dynamic = "force-dynamic";

export default async function AdminHomepageEditorPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#F6F6F2] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1F8A4C]">Master Admin</p>
            <h1 className="text-2xl font-extrabold text-[#112016] sm:text-3xl">Homepage Content</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#4B6354]">Edit the public hero, pastor section, and homepage CTA. Ministries and announcements remain editable in the main Content Manager.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="inline-flex min-h-10 items-center rounded-lg border border-[#CFEAD9] bg-white px-4 text-sm font-bold text-[#16643A]">View Homepage</Link>
            <Link href="/admin" className="inline-flex min-h-10 items-center rounded-lg bg-[#1F8A4C] px-4 text-sm font-bold text-white">Back to Admin</Link>
          </div>
        </div>
        <HomepageContentManager />
      </div>
    </main>
  );
}

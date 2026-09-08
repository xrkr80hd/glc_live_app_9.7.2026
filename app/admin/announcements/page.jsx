import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#f4f7f5]">
      <div className="border-b border-[#dbe7e0] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[#5f7469]">
            <Link href="/admin" className="font-semibold text-[#1f6846] hover:underline">Master Admin</Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#173329]">Announcements</span>
          </div>
          <Link href="/" className="rounded-xl border border-[#bfd3c7] px-3 py-2 text-sm font-semibold text-[#1f6846] hover:bg-[#edf6f1]">View Website</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        <AnnouncementsManager />
      </div>
    </main>
  );
}

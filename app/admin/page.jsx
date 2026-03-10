import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboard username={session.username} />;
}


import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSessionFromServerCookies();
  if (session) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}


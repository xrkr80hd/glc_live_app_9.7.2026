import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies, getAdminUpgradeSessionFromMemberCookies } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  const session = await getAdminSessionFromServerCookies();
  if (session) {
    redirect("/admin");
  }

  const memberUpgradeSession = await getAdminUpgradeSessionFromMemberCookies();
  if (memberUpgradeSession) {
    redirect("/api/admin/login/member?next=/admin");
  }

  const params = await searchParams;
  const initialError =
    params?.error === "member-upgrade"
      ? "Your member account is signed in, but it is not upgraded for admin access yet."
      : "";

  return <AdminLoginForm initialError={initialError} />;
}


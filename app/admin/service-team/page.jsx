import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { ServiceTeamClient } from "@/components/admin/ServiceTeamClient";

export const dynamic = "force-dynamic";

export default async function ServiceTeamAdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) {
    redirect("/admin/login");
  }

  return <ServiceTeamClient />;
}

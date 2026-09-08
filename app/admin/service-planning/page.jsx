import { redirect } from "next/navigation";
import { getAdminSessionFromServerCookies } from "@/lib/admin-auth";
import { ServicePlanningClient } from "@/components/admin/ServicePlanningClient";

export const dynamic = "force-dynamic";

export default async function ServicePlanningAdminPage() {
  const session = await getAdminSessionFromServerCookies();
  if (!session) {
    redirect("/admin/login");
  }

  return <ServicePlanningClient />;
}

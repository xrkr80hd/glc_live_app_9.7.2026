import { redirect } from "next/navigation";
import { RoleAccessPage } from "@/components/dashboard/RoleAccessPage";
import { getDashboardViewerContext } from "@/lib/role-dashboard-config";

export const dynamic = "force-dynamic";

export default async function DashboardRoleAccessPage() {
  const viewer = await getDashboardViewerContext();
  if (!viewer) {
    redirect("/member-access");
  }

  return <RoleAccessPage viewer={viewer} />;
}

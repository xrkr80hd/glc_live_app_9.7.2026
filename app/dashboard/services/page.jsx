import { redirect } from "next/navigation";
import { SharedServicePlanClient } from "@/components/dashboard/SharedServicePlanClient";
import { getDashboardViewerContext } from "@/lib/role-dashboard-config";
import { hasAnyRole } from "@/lib/admin-role-access";

export const dynamic = "force-dynamic";

const SERVICE_PLAN_ROLES = ["worship_team", "worship_leader", "media_team", "foh_sound", "pastor", "superuser"];

export default async function SharedServicesPage() {
  const viewer = await getDashboardViewerContext();
  if (!viewer) {
    redirect("/member-access");
  }

  const allowed = viewer.isSuperuser || hasAnyRole(viewer.roleKeys, SERVICE_PLAN_ROLES);
  if (!allowed) {
    redirect(viewer.primaryDashboardPath || "/member");
  }

  const roleLabel = viewer.isSuperuser
    ? "Master Admin"
    : viewer.roleKeys.includes("worship_leader")
      ? "Worship Leader"
      : viewer.roleKeys.includes("media_team")
        ? "Media Team"
        : viewer.roleKeys.includes("foh_sound")
          ? "FOH Sound"
          : viewer.roleKeys.includes("worship_team")
            ? "Worship Team"
            : viewer.roleKeys.includes("pastor")
              ? "Pastor"
              : "Ministry Team";

  return <SharedServicePlanClient roleLabel={roleLabel} />;
}

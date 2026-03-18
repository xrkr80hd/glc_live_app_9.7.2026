import { RoleDashboardRoute } from "@/components/dashboard/RoleDashboardRoute";

export const dynamic = "force-dynamic";

export default async function DashboardRolePage({ params }) {
  return <RoleDashboardRoute dashboardSlug={params.dashboard} />;
}

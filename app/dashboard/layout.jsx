import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const currentMember = await getCurrentMemberFromServerCookies();

  if (!currentMember) {
    redirect("/member-access");
  }

  return children;
}

import { redirect } from "next/navigation";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export default async function MemberLayout({ children }) {
  const currentMember = await getCurrentMemberFromServerCookies();

  if (!currentMember) {
    redirect("/member-access");
  }

  return children;
}

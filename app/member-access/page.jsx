import { redirect } from "next/navigation";
import { MemberAccessScreen } from "@/components/app-shell/MemberAccessScreen";
import { getMemberSessionFromServerCookies } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export default async function MemberAccessPage({ searchParams }) {
  const session = await getMemberSessionFromServerCookies();
  if (session) {
    redirect("/member");
  }

  const params = await searchParams;
  const initialView = params?.verified === "1" ? "verified" : "signin";
  const initialMessage =
    params?.error === "verification"
      ? "That verification link is no longer valid. Please create your account again or sign in."
      : "";

  return <MemberAccessScreen initialView={initialView} initialMessage={initialMessage} />;
}

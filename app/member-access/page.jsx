import { redirect } from "next/navigation";
import { MemberAccessScreen } from "@/components/app-shell/MemberAccessScreen";
import { getMemberSessionFromServerCookies } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export default async function MemberAccessPage({ searchParams }) {
  const session = await getMemberSessionFromServerCookies();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const initialView = params?.verified === "1" ? "verified" : "signin";

  let initialMessage = "";
  if (params?.error === "verification") {
    initialMessage = "That link is no longer valid. Request a fresh link and try again.";
  } else if (params?.passwordReset === "1") {
    initialMessage = "Password updated. Sign in with your new password.";
  } else if (params?.emailChanged === "1") {
    initialMessage = "Email updated. Sign in with your new email and password.";
  }

  return <MemberAccessScreen initialView={initialView} initialMessage={initialMessage} />;
}

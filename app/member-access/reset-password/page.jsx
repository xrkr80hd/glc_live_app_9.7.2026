import { MemberResetPasswordScreen } from "@/components/app-shell/MemberResetPasswordScreen";

export const dynamic = "force-dynamic";

export default async function MemberResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const initialError =
    params?.error === "verification"
      ? "This reset link is no longer valid. Request a new reset email."
      : "";

  return <MemberResetPasswordScreen initialError={initialError} />;
}

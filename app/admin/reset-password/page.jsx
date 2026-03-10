import { Suspense } from "react";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";

export const dynamic = "force-dynamic";

export default function AdminResetPasswordPage() {
  return (
    <Suspense>
      <AdminResetPasswordForm />
    </Suspense>
  );
}

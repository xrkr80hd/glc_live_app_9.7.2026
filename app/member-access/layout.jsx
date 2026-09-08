import "./auth.css";
import { AuthNavigation } from "@/components/app-shell/AuthNavigation";

export default function MemberAccessLayout({ children }) {
  return (
    <>
      <AuthNavigation />
      {children}
    </>
  );
}

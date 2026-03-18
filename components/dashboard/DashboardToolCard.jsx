import { getDashboardIcon, IconChevronRight } from "@/components/dashboard/dashboard-icons";
import Link from "next/link";

export function DashboardToolCard({ label, description, href = null, icon = "grid", tone = "default" }) {
  const Icon = getDashboardIcon(icon);
  const className = `lc-dashboard-tool-card${href ? " is-link" : ""}${tone !== "default" ? ` is-${tone}` : ""}`;

  const content = (
    <>
      <span className="lc-dashboard-tool-card-icon" aria-hidden="true">
        <Icon size={20} stroke={1.8} />
      </span>
      <span className="lc-dashboard-tool-card-copy">
        <strong>{label}</strong>
        <span>{description}</span>
      </span>
      <span className="lc-dashboard-tool-card-arrow" aria-hidden="true">
        <IconChevronRight size={18} stroke={1.8} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}

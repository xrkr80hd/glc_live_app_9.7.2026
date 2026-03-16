import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

export function SettingsRow({ icon: Icon, label, description, href = null, disabled = false }) {
  const content = (
    <>
      <span className="lc-settings-row-icon" aria-hidden="true">
        {Icon ? <Icon size={20} stroke={1.8} /> : null}
      </span>
      <span className="lc-settings-row-copy">
        <strong>{label}</strong>
        {description ? <span>{description}</span> : null}
      </span>
      <span className="lc-settings-row-arrow" aria-hidden="true">
        <IconChevronRight size={18} stroke={1.8} />
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="lc-settings-row">
        {content}
      </Link>
    );
  }

  return <div className={`lc-settings-row${disabled ? " lc-empty-row" : ""}`}>{content}</div>;
}
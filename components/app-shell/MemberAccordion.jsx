import { IconChevronDown } from "@tabler/icons-react";

export function MemberAccordion({ title, description = "", defaultOpen = false, children }) {
  return (
    <details className="lc-accordion-card" open={defaultOpen}>
      <summary className="lc-accordion-summary">
        <span className="lc-accordion-copy">
          <strong>{title}</strong>
          {description ? <span>{description}</span> : null}
        </span>
        <span className="lc-accordion-chevron" aria-hidden="true">
          <IconChevronDown size={18} stroke={2} />
        </span>
      </summary>
      <div className="lc-accordion-panel">{children}</div>
    </details>
  );
}

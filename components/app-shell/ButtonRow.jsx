import Link from "next/link";

export function ButtonRow({ actions, columns = 2 }) {
  return (
    <div className="lc-button-row" style={{ "--button-cols": columns }}>
      {actions.map((action) => {
        const Icon = action.icon;
        const className = action.variant ? `lc-action-link ${action.variant}` : "lc-action-link";

        if (action.href) {
          return (
            <Link key={action.label} href={action.href} className={className}>
              {Icon ? <Icon size={18} stroke={1.8} /> : null}
              <span>{action.label}</span>
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            type={action.type || "button"}
            className={action.variant ? `lc-action-btn ${action.variant}` : "lc-action-btn"}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {Icon ? <Icon size={18} stroke={1.8} /> : null}
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

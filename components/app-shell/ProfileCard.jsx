import { IconMail } from "@tabler/icons-react";

export function ProfileCard({ name, email, uploadLabel = null, footer = null }) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "LC";

  return (
    <section className="lc-profile-card">
      <div className="lc-profile-card-top">
        <div className="lc-profile-photo" aria-hidden="true">
          <span>{initials}</span>
        </div>
        <div className="lc-identity-copy">
          <h2>{name}</h2>
          <div className="lc-announcement-meta">
            <IconMail size={16} stroke={1.8} />
            <span>{email}</span>
          </div>
          {uploadLabel ? <span className="lc-upload-badge">{uploadLabel}</span> : null}
        </div>
      </div>
      {footer}
    </section>
  );
}

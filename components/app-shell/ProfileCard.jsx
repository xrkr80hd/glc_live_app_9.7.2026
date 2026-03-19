import Link from "next/link";
import { IconMail, IconPencil } from "@tabler/icons-react";

export function ProfileCard({ name, email, photoUrl = "", uploadLabel = null, footer = null, editPhotoHref = null }) {
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
        <div className="lc-profile-photo">
          {photoUrl ? <img src={photoUrl} alt={`${name} profile`} className="lc-profile-photo-image" /> : <span>{initials}</span>}
          {editPhotoHref ? (
            <Link href={editPhotoHref} className="lc-profile-photo-edit" aria-label="Edit profile photo">
              <IconPencil size={10} stroke={2.2} />
            </Link>
          ) : null}
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

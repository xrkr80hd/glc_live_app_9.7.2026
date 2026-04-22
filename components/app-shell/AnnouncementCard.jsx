import Link from "next/link";
import { IconCalendarWeek, IconChevronRight } from "@tabler/icons-react";

export function AnnouncementCard({
  title,
  summary,
  date,
  href = null,
  ctaLabel = "Open",
  imageUrl = "",
  imageAlt = "",
}) {
  const normalizedImageUrl = String(imageUrl || "").trim();
  const normalizedImageAlt = String(imageAlt || "").trim() || (title ? `${title} announcement image` : "Announcement image");

  const cardContent = (
    <>
      {normalizedImageUrl ? (
        <div
          style={{
            marginBottom: "0.72rem",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(140, 152, 164, 0.28)",
            background: "rgba(8, 16, 26, 0.06)",
          }}
        >
          <img
            src={normalizedImageUrl}
            alt={normalizedImageAlt}
            loading="lazy"
            style={{
              width: "100%",
              display: "block",
              aspectRatio: "16 / 9",
              objectFit: "cover",
            }}
          />
        </div>
      ) : null}
      <div className="lc-announcement-meta">
        <IconCalendarWeek size={16} stroke={1.8} />
        <span>{date}</span>
      </div>
      <h3>{title}</h3>
      <p className="lc-muted">{summary}</p>
      <span className="lc-announcement-cta">
        <span>{ctaLabel}</span>
        <IconChevronRight size={16} stroke={1.8} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="lc-announcement-card">
        {cardContent}
      </Link>
    );
  }

  return <article className="lc-announcement-card">{cardContent}</article>;
}

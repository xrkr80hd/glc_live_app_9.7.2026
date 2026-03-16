import Link from "next/link";
import { IconCalendarWeek, IconChevronRight } from "@tabler/icons-react";

export function AnnouncementCard({ title, summary, date, href = null, ctaLabel = "Open" }) {
  const cardContent = (
    <>
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
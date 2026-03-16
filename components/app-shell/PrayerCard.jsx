import { IconMessageCircleHeart } from "@tabler/icons-react";

export function PrayerCard({ title, request, meta }) {
  return (
    <article className="lc-prayer-card">
      <div className="lc-announcement-meta">
        <IconMessageCircleHeart size={16} stroke={1.8} />
        <span>{meta}</span>
      </div>
      <h3>{title}</h3>
      <p>{request}</p>
    </article>
  );
}
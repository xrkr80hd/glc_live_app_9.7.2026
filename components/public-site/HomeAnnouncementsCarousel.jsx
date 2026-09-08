"use client";

export function HomeAnnouncementsCarousel({ announcements = [] }) {
  if (!announcements.length) {
    return (
      <div className="rounded-[18px] border border-[#CFEAD9] bg-white px-5 py-6 text-[#4B6354] shadow-[0_8px_24px_rgba(17,32,22,0.06)]">
        No announcements at this time.
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {announcements.map((announcement, index) => (
        <article
          key={announcement.id || index}
          className="overflow-hidden rounded-[18px] border border-[#CFEAD9] bg-white shadow-[0_8px_24px_rgba(17,32,22,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(17,32,22,0.12)] sm:rounded-[20px]"
        >
          {announcement.imageUrl ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8FBF9]">
              <img
                src={announcement.imageUrl}
                alt={announcement.imageAlt || announcement.title || "Liberty Church announcement"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="space-y-2 px-5 py-5 sm:px-6 sm:py-6">
            <h3 className="text-[1.08rem] font-bold leading-snug text-[#112016] sm:text-xl">
              {announcement.title}
            </h3>
            {announcement.body ? (
              <p className="whitespace-pre-line text-[0.95rem] leading-6 text-[#4B6354] sm:text-base sm:leading-7">
                {announcement.body}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

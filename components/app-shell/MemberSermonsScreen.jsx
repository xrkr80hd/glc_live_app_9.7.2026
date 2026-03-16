"use client";

import { useMemo, useState } from "react";
import { IconPlayerPlay, IconSearch, IconVideo } from "@tabler/icons-react";
import { formatMemberDate } from "@/lib/member-page-data";

export function MemberSermonsScreen({ videos = [] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(videos[0]?.id || "");

  const filteredVideos = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return videos;
    }

    return videos.filter((item) => {
      const searchable = `${item.title || ""} ${item.description || ""}`.toLowerCase();
      return searchable.includes(normalized);
    });
  }, [query, videos]);

  const selectedVideo = useMemo(() => {
    return filteredVideos.find((item) => item.id === selectedId) || filteredVideos[0] || null;
  }, [filteredVideos, selectedId]);

  return (
    <div className="lc-stack">
      <section className="lc-card">
        <div className="lc-section-head">
          <h2>Latest Messages</h2>
          <p className="lc-muted">Search the recent sermon library and open a message with one tap.</p>
        </div>
        <label className="lc-search-wrap" htmlFor="member-sermons-search">
          <IconSearch size={18} stroke={1.8} />
          <input
            id="member-sermons-search"
            className="lc-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
          />
        </label>
      </section>

      {selectedVideo ? (
        <section className="lc-card alt">
          <div className="lc-section-head">
            <h2>{selectedVideo.title}</h2>
            <p className="lc-muted">{formatMemberDate(selectedVideo.publishedAt, "Recent message")}</p>
          </div>
          <div className="lc-video-frame">
            <iframe
              src={selectedVideo.embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              title={selectedVideo.title || "Sermon"}
            />
          </div>
        </section>
      ) : (
        <section className="lc-card alt">
          <div className="lc-empty-state">
            <IconVideo size={26} stroke={1.8} />
            <strong>No sermons found</strong>
            <span className="lc-muted">Try a different search or check back after the next upload.</span>
          </div>
        </section>
      )}

      <section className="lc-stack">
        {filteredVideos.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`lc-announcement-card${selectedVideo?.id === item.id ? " is-selected" : ""}`}
            onClick={() => setSelectedId(item.id)}
            aria-pressed={selectedVideo?.id === item.id}
          >
            <div className="lc-announcement-meta">
              <span>{formatMemberDate(item.publishedAt, "Message")}</span>
            </div>
            <h3>{item.title}</h3>
            <p className="lc-muted">
              {item.description?.trim()
                ? item.description
                : "Open this message to watch the full sermon in the member area."}
            </p>
            <span className="lc-announcement-cta">
              <IconPlayerPlay size={16} stroke={1.8} />
              <span>Watch Sermon</span>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString();
}

export function SermonsClient({ videos }) {
  const [activeVideoId, setActiveVideoId] = useState(videos?.[0]?.id || "");

  const activeVideo = useMemo(
    () => videos.find((video) => video.id === activeVideoId) || videos[0] || null,
    [videos, activeVideoId],
  );

  if (!videos.length) {
    return (
      <article className="card">
        <h2>No sermons available yet</h2>
        <p>
          Add a YouTube API key/channel or publish sermon records in Supabase, then this page
          will auto-populate.
        </p>
      </article>
    );
  }

  return (
    <div className="stack-lg">
      <div className="video-wrap">
        {activeVideo?.embedUrl ? (
          <iframe
            src={activeVideo.embedUrl}
            title={activeVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="video-empty">This sermon does not have a playable video.</div>
        )}
      </div>

      <article className="card">
        <h2>{activeVideo?.title || "Sermon"}</h2>
        {activeVideo?.publishedAt ? (
          <p className="muted-text">{formatDate(activeVideo.publishedAt)}</p>
        ) : null}
        {activeVideo?.description ? <p>{activeVideo.description}</p> : null}
      </article>

      <div className="cards sermons-grid">
        {videos.map((video) => (
          <button
            type="button"
            key={video.id}
            className={`sermon-card ${video.id === activeVideo?.id ? "sermon-card-active" : ""}`}
            onClick={() => setActiveVideoId(video.id)}
          >
            {video.thumbnail ? (
              <img src={video.thumbnail} alt="" loading="lazy" />
            ) : (
              <div className="sermon-thumb-empty">No Thumbnail</div>
            )}
            <span className="sermon-title">{video.title}</span>
            {video.publishedAt ? (
              <span className="sermon-date">{formatDate(video.publishedAt)}</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

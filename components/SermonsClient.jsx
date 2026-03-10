"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconBook2,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconDeviceTv,
  IconEye,
  IconEyeOff,
  IconPlayerPlay,
  IconVideo,
} from "@tabler/icons-react";

function isValidVideoId(id) {
  return /^[A-Za-z0-9_-]{11}$/.test(String(id || ""));
}

function embedFromVideo(video) {
  if (!video) {
    return "";
  }
  if (video.embedUrl) {
    return video.embedUrl;
  }
  if (isValidVideoId(video.id)) {
    return `https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`;
  }
  return "";
}

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

export function SermonsClient({ videos = [] }) {
  const [selectedId, setSelectedId] = useState(videos[0]?.id || "");
  const [recentShown, setRecentShown] = useState(6);
  const [playlists, setPlaylists] = useState([]);
  const [playlistShown, setPlaylistShown] = useState({});
  const [openPlaylistIds, setOpenPlaylistIds] = useState({});
  const [archived, setArchived] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLocalData() {
      try {
        const [sermonsRes, archivedRes] = await Promise.all([
          fetch("/assets/data/sermons.json", { cache: "no-store" }),
          fetch("/assets/data/archived.json", { cache: "no-store" }),
        ]);

        if (active && sermonsRes.ok) {
          const sermonsData = await sermonsRes.json();
          const nextPlaylists = Array.isArray(sermonsData?.playlists) ? sermonsData.playlists : [];
          setPlaylists(nextPlaylists);
          const shownMap = {};
          for (const playlist of nextPlaylists) {
            shownMap[playlist.id] = 8;
          }
          setPlaylistShown(shownMap);
        }

        if (active && archivedRes.ok) {
          const archivedData = await archivedRes.json();
          setArchived(Array.isArray(archivedData) ? archivedData : []);
        }
      } catch {
        // Keep existing fallback states.
      }
    }

    loadLocalData();
    return () => {
      active = false;
    };
  }, []);

  const selectedVideo = useMemo(() => {
    return videos.find((video) => video.id === selectedId) || videos[0] || null;
  }, [videos, selectedId]);

  const selectedEmbed = useMemo(() => embedFromVideo(selectedVideo), [selectedVideo]);

  const recentVideos = useMemo(() => videos.slice(0, recentShown), [videos, recentShown]);
  const canLoadMoreRecent = videos.length > recentShown;
  const canCollapseRecent = recentShown > 6;

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h1>
              <span className="title-inline">
                <IconDeviceTv size={32} stroke={1.8} aria-hidden="true" />
                <span>Messages</span>
              </span>
            </h1>
            <p className="muted">Watch recent uploads, browse series, or view archived sermons. Tap any card to play below.</p>
          </div>
          <div className="embed aspect-16x9" id="sermonPlayer">
            {selectedEmbed ? (
              <div className="content">
                <iframe
                  src={selectedEmbed}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  title={selectedVideo?.title || "Sermon"}
                />
              </div>
            ) : (
              <div className="content placeholder" style={{ padding: 28 }}>
                No sermons available yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>
            <span className="heading-inline">
              <IconVideo size={28} stroke={1.8} aria-hidden="true" />
              <span>Recently Uploaded</span>
            </span>
          </h2>
          <div className="cards" id="recentGrid">
            {recentVideos.map((video) => (
              <article
                key={video.id}
                className="card"
                data-id={video.id}
                onClick={() => setSelectedId(video.id)}
                style={{ cursor: "pointer" }}
              >
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt="" style={{ width: "100%", height: "auto", borderRadius: 10 }} loading="lazy" />
                ) : null}
                <h3>{video.title || "Untitled"}</h3>
                <p className="muted">{formatDate(video.publishedAt)}</p>
              </article>
            ))}
          </div>
          {(canLoadMoreRecent || canCollapseRecent) ? (
            <div className="btn-group mt-16" id="recentControls">
              {canLoadMoreRecent ? (
                <button
                  id="btnMoreRecent"
                  className="btn small"
                  type="button"
                  onClick={() => setRecentShown((current) => Math.min(current + 6, videos.length))}
                >
                  <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />
                  Load more
                </button>
              ) : null}
              {canCollapseRecent ? (
                <button
                  id="btnCollapseRecent"
                  className="btn ghost small"
                  type="button"
                  onClick={() => setRecentShown(6)}
                >
                  <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />
                  Collapse
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>
            <span className="heading-inline">
              <IconBook2 size={28} stroke={1.8} aria-hidden="true" />
              <span>Series</span>
            </span>
          </h2>
          <div id="seriesList">
            {playlists.length ? (
              playlists.map((playlist) => {
                const shownCount = playlistShown[playlist.id] || 8;
                const items = Array.isArray(playlist.items) ? playlist.items : [];
                const shownItems = items.slice(0, shownCount);
                const isOpen = Boolean(openPlaylistIds[playlist.id]);
                return (
                  <div key={playlist.id} className="series-item">
                    <button
                      className="series-toggle"
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenPlaylistIds((current) => ({
                          ...current,
                          [playlist.id]: !current[playlist.id],
                        }))
                      }
                    >
                      <span className="series-title">{playlist.title || "Series"}</span>
                      <span className="series-meta">
                        <span>{playlist.itemCount || items.length} messages</span>
                        <IconChevronDown className="series-chevron-icon" size={14} stroke={2.1} aria-hidden="true" />
                      </span>
                    </button>
                    <div className="series-panel" hidden={!isOpen}>
                      <ul className="list">
                        {shownItems.map((item) => (
                          <li key={`${playlist.id}-${item.id}`}>
                            <button className="btn ghost" type="button" onClick={() => setSelectedId(item.id)}>
                              <IconPlayerPlay size={16} stroke={1.9} aria-hidden="true" />
                              {item.title || "Untitled"}
                            </button>{" "}
                            <span className="muted">{formatDate(item.publishedAt)}</span>
                          </li>
                        ))}
                      </ul>
                      {shownCount < items.length ? (
                        <button
                          className="btn small"
                          type="button"
                          onClick={() =>
                            setPlaylistShown((current) => ({
                              ...current,
                              [playlist.id]: Math.min((current[playlist.id] || 8) + 10, items.length),
                            }))
                          }
                        >
                          <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />
                          Load more ({items.length - shownCount})
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="muted">Series list coming soon.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>
            <span className="heading-inline">
              <IconClock size={28} stroke={1.8} aria-hidden="true" />
              <span>Archived Sermons</span>
            </span>
          </h2>
          <p className="muted">Older messages curated by our team.</p>
          <div className="card">
            <button
              id="toggleArchived"
              className="btn ghost"
              type="button"
              aria-expanded={showArchived}
              aria-controls="archivedList"
              onClick={() => setShowArchived((current) => !current)}
            >
              {showArchived ? <IconEyeOff size={16} stroke={1.9} aria-hidden="true" /> : <IconEye size={16} stroke={1.9} aria-hidden="true" />}
              {showArchived ? "Hide archived" : "Show archived"}
            </button>
            <div id="archivedList" className="mt-12" hidden={!showArchived}>
              <ul className="list" id="archivedUl">
                {archived.map((item, index) => (
                  <li key={`${item.id || item.title || "archived"}-${index}`}>
                    <button className="btn ghost" type="button" onClick={() => setSelectedId(item.id)}>
                      <IconPlayerPlay size={16} stroke={1.9} aria-hidden="true" />
                      {item.title || "Untitled"}
                    </button>{" "}
                    <span className="muted">{formatDate(item.publishedAt || item.date || item.preachedOn)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

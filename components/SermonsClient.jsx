"use client";

import { useEffect, useMemo, useState } from "react";

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
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-[#3F4D48] sm:text-4xl">Watch Sermons</h1>
          <p className="text-base leading-7 text-[#3F4D48]">
            Watch recent uploads, browse series, or view archived sermons. Select any message to play below.
          </p>
        </div>
        <div id="sermonPlayer" className="overflow-hidden border border-[#E3E8E6] bg-white">
          {selectedEmbed ? (
            <iframe
              src={selectedEmbed}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              title={selectedVideo?.title || "Sermon"}
            />
          ) : (
            <div className="px-4 py-12 text-center text-base text-[#3F4D48] sm:px-6">No sermons available yet.</div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Recent</p>
          <h2 className="text-2xl font-semibold text-[#3F4D48] sm:text-3xl">Recently Uploaded</h2>
        </div>
        <div id="recentGrid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentVideos.map((video) => {
            const isSelected = selectedId === video.id;
            return (
              <button
                key={video.id}
                type="button"
                data-id={video.id}
                onClick={() => setSelectedId(video.id)}
                className={`flex h-full flex-col overflow-hidden border bg-white text-left transition-colors ${
                  isSelected ? "border-[#1F4D3A]" : "border-[#E3E8E6] hover:border-[#2E7D32]"
                }`}
              >
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt="" className="h-44 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-44 w-full bg-[#F6F6F2]" aria-hidden="true" />
                )}
                <div className="space-y-1 p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-[#3F4D48]">{video.title || "Untitled"}</h3>
                  <p className="text-sm text-[#3F4D48]/80">{formatDate(video.publishedAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
        {(canLoadMoreRecent || canCollapseRecent) ? (
          <div id="recentControls" className="flex flex-wrap gap-3">
            {canLoadMoreRecent ? (
              <button
                id="btnMoreRecent"
                type="button"
                className="h-10 border border-[#1F4D3A] bg-white px-4 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#2E7D32] hover:text-white"
                onClick={() => setRecentShown((current) => Math.min(current + 6, videos.length))}
              >
                Load more
              </button>
            ) : null}
            {canCollapseRecent ? (
              <button
                id="btnCollapseRecent"
                type="button"
                className="h-10 border border-[#E3E8E6] bg-white px-4 text-sm font-semibold text-[#3F4D48] transition-colors hover:bg-[#F6F6F2]"
                onClick={() => setRecentShown(6)}
              >
                Collapse
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Series</p>
          <h2 className="text-2xl font-semibold text-[#3F4D48] sm:text-3xl">Browse by Series</h2>
        </div>
        <div id="seriesList" className="space-y-3">
          {playlists.length ? (
            playlists.map((playlist) => {
              const shownCount = playlistShown[playlist.id] || 8;
              const items = Array.isArray(playlist.items) ? playlist.items : [];
              const shownItems = items.slice(0, shownCount);
              const isOpen = Boolean(openPlaylistIds[playlist.id]);
              return (
                <div key={playlist.id} className="overflow-hidden border border-[#E3E8E6] bg-white">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"
                    onClick={() =>
                      setOpenPlaylistIds((current) => ({
                        ...current,
                        [playlist.id]: !current[playlist.id],
                      }))
                    }
                  >
                    <span className="text-base font-semibold text-[#3F4D48]">{playlist.title || "Series"}</span>
                    <span className="text-sm text-[#3F4D48]/80">{playlist.itemCount || items.length} messages</span>
                  </button>
                  <div className="border-t border-[#E3E8E6] px-4 py-4 sm:px-5" hidden={!isOpen}>
                    <ul className="space-y-2">
                      {shownItems.map((item) => (
                        <li key={`${playlist.id}-${item.id}`} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <button
                            type="button"
                            className="text-left text-sm font-medium text-[#3F4D48] transition-colors hover:text-[#1F4D3A]"
                            onClick={() => setSelectedId(item.id)}
                          >
                            {item.title || "Untitled"}
                          </button>
                          <span className="text-sm text-[#3F4D48]/80">{formatDate(item.publishedAt)}</span>
                        </li>
                      ))}
                    </ul>
                    {shownCount < items.length ? (
                      <button
                        type="button"
                        className="mt-4 h-10 border border-[#1F4D3A] bg-white px-4 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#2E7D32] hover:text-white"
                        onClick={() =>
                          setPlaylistShown((current) => ({
                            ...current,
                            [playlist.id]: Math.min((current[playlist.id] || 8) + 10, items.length),
                          }))
                        }
                      >
                        Load more ({items.length - shownCount})
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-base text-[#3F4D48]">Series list coming soon.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2E7D32]">Archive</p>
          <h2 className="text-2xl font-semibold text-[#3F4D48] sm:text-3xl">Archived Sermons</h2>
          <p className="text-base text-[#3F4D48]">Older messages curated by our team.</p>
        </div>
        <div className="border border-[#E3E8E6] bg-white p-4 sm:p-5">
          <button
            id="toggleArchived"
            type="button"
            aria-expanded={showArchived}
            aria-controls="archivedList"
            className="h-10 border border-[#1F4D3A] bg-white px-4 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#2E7D32] hover:text-white"
            onClick={() => setShowArchived((current) => !current)}
          >
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
          <div id="archivedList" className="mt-4" hidden={!showArchived}>
            <ul id="archivedUl" className="space-y-2">
              {archived.map((item, index) => (
                <li key={`${item.id || item.title || "archived"}-${index}`} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-[#3F4D48] transition-colors hover:text-[#1F4D3A]"
                    onClick={() => setSelectedId(item.id)}
                  >
                    {item.title || "Untitled"}
                  </button>
                  <span className="text-sm text-[#3F4D48]/80">{formatDate(item.publishedAt || item.date || item.preachedOn)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}


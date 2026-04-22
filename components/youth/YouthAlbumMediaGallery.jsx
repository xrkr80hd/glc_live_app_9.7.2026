"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { IconExternalLink, IconPlayerPlayFilled, IconX } from "@tabler/icons-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent } from "@/components/ui/card";
import { formatMemberDate, summarizeText } from "@/lib/member-page-data";

function renderVideoSurface(video, { preview = false } = {}) {
  if (preview && video.thumbnailUrl) {
    return <img src={video.thumbnailUrl} alt={`${video.title} thumbnail`} loading="lazy" className="h-full w-full object-cover" />;
  }

  if (!preview && video.embedUrl) {
    return (
      <iframe
        src={video.embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        title={video.title}
        className="aspect-video w-full"
      />
    );
  }

  if (!preview && video.isDirectVideo) {
    return (
      <video controls preload="metadata" poster={video.thumbnailUrl || undefined} className="aspect-video w-full bg-black">
        <source src={video.videoUrl} />
      </video>
    );
  }

  if (!preview && video.thumbnailUrl) {
    return <img src={video.thumbnailUrl} alt={`${video.title} thumbnail`} loading="lazy" className="aspect-video w-full object-cover" />;
  }

  return (
    <div className="flex h-full min-h-[10rem] items-center justify-center bg-[#10182a] px-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/46">
      Video
    </div>
  );
}

function VideoCard({ video, index, onOpen }) {
  return (
    <BlurFade inView delay={0.14 + index * 0.03}>
      <button
        type="button"
        onClick={() => onOpen(video.id)}
        className="block w-full text-left transition duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ee0c2]/65"
        aria-label={`Play ${video.title}`}
      >
        <Card className="mx-auto h-full w-full max-w-[21.5rem] overflow-hidden border border-[#66e49e]/20 bg-[#172034] py-0 text-white shadow-sm sm:max-w-none">
          <div className="relative aspect-video overflow-hidden border-b border-[#66e49e]/14 bg-black">
            {renderVideoSurface(video, { preview: true })}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08101c]/88 via-[#08101c]/12 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center rounded-full border border-white/12 bg-[#08101c]/82 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#c8f2df]">
                Video
              </span>
              <span className="inline-flex size-10 items-center justify-center rounded-full border border-[#8ee0c2]/28 bg-[#0b1524]/82 text-[#8ee0c2]">
                <IconPlayerPlayFilled size={18} aria-hidden="true" />
              </span>
            </div>
          </div>
          <CardContent className="space-y-2 px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">
              {formatMemberDate(video.recordedOn || video.createdAt, "Date unavailable")}
            </p>
            <h3 className="text-base font-semibold leading-tight text-white sm:text-lg">{video.title}</h3>
            <p className="text-sm leading-6 text-white/72">{summarizeText(video.description || "Tap to watch this youth video.", 88)}</p>
          </CardContent>
        </Card>
      </button>
    </BlurFade>
  );
}

export function YouthAlbumMediaGallery({ albumTitle, photos = [], videos = [] }) {
  const [activeVideoId, setActiveVideoId] = useState(null);

  const activeVideo = useMemo(() => videos.find((item) => item.id === activeVideoId) || null, [activeVideoId, videos]);

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-4">
          <BlurFade inView delay={0.08}>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Photos</h2>
              <p className="text-sm leading-6 text-white/70">Captured moments from this youth event.</p>
            </div>
          </BlurFade>
          {photos.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo, index) => (
                <BlurFade key={photo.id} inView delay={0.1 + index * 0.02}>
                  <Card className="mx-auto w-full max-w-[21.5rem] overflow-hidden border border-[#66e49e]/20 bg-[#172034] py-0 text-white shadow-sm sm:max-w-none">
                    <img src={photo.photoUrl} alt={photo.caption || `${albumTitle} photo`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <CardContent className="space-y-1 px-4 py-4">
                      <p className="text-sm font-semibold text-white">{photo.caption || "Event photo"}</p>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">
                        {formatMemberDate(photo.takenOn || photo.createdAt, "Date unavailable")}
                      </p>
                    </CardContent>
                  </Card>
                </BlurFade>
              ))}
            </div>
          ) : (
            <Card className="border border-[#66e49e]/22 bg-[#172034] text-white shadow-sm">
              <CardContent className="px-5 py-6">
                <p className="text-white/76">No photos have been added to this album yet.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <BlurFade inView delay={0.12}>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Videos</h2>
              <p className="text-sm leading-6 text-white/70">Tap a clip to open it.</p>
            </div>
          </BlurFade>
          {videos.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} onOpen={setActiveVideoId} />
              ))}
            </div>
          ) : (
            <Card className="border border-[#66e49e]/22 bg-[#172034] text-white shadow-sm">
              <CardContent className="px-5 py-6">
                <p className="text-white/76">No videos have been connected to this album yet.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      <DialogPrimitive.Root open={Boolean(activeVideo)} onOpenChange={(isOpen) => !isOpen && setActiveVideoId(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/82 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.35rem] border border-[#66e49e]/20 bg-[#0d1523] shadow-[0_36px_90px_rgba(0,0,0,0.58)] focus:outline-none">
            {activeVideo ? (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-white/8 px-4 py-4 sm:px-5">
                  <div className="min-w-0 space-y-1">
                    <DialogPrimitive.Title className="text-lg font-semibold leading-tight text-white sm:text-xl">
                      {activeVideo.title}
                    </DialogPrimitive.Title>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#8ee0c2]">
                      {formatMemberDate(activeVideo.recordedOn || activeVideo.createdAt, "Date unavailable")}
                    </p>
                    <DialogPrimitive.Description className="text-sm leading-6 text-white/72">
                      {summarizeText(activeVideo.description || "Youth event video.", 140)}
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/78 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ee0c2]/60">
                    <IconX size={18} aria-hidden="true" />
                    <span className="sr-only">Close video</span>
                  </DialogPrimitive.Close>
                </div>

                <div className="bg-black">{renderVideoSurface(activeVideo)}</div>

                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                  <p className="text-xs text-white/56">Tap outside the player or press Escape to close.</p>
                  {activeVideo.watchUrl ? (
                    <Link
                      href={activeVideo.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#8ee0c2] transition hover:text-white"
                    >
                      Watch on YouTube
                      <IconExternalLink size={16} aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

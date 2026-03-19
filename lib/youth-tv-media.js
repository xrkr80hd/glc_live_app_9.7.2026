import { getYouthEventAlbumById, getYouthEventAlbums } from "@/lib/content";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MAX_ALBUMS = 6;
const DEFAULT_MAX_ITEMS = 18;
const YOUTH_TV_PUBLIC_DIR = "/assets/lc_youth_tv";
const YOUTH_TV_ASSET_DIR = path.join(process.cwd(), "public", "assets", "lc_youth_tv");
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogg"]);
const PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const EXCLUDED_LOCAL_ASSET_NAMES = new Set(["lc_youth_tv.png"]);

function toSortableTimestamp(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return 0;
  }

  const date = new Date(raw);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
}

function pushUniqueMedia(target, seen, item) {
  const mediaUrl = String(item?.src || "").trim();
  if (!mediaUrl) {
    return;
  }

  const uniqueKey = `${item.kind}:${mediaUrl}`;
  if (seen.has(uniqueKey)) {
    return;
  }

  seen.add(uniqueKey);
  target.push(item);
}

function toAssetCaption(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPublicAssetPath(fileName) {
  return `${YOUTH_TV_PUBLIC_DIR}/${encodeURIComponent(fileName)}`;
}

function isExcludedLocalAsset(fileName) {
  const normalized = String(fileName || "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  if (EXCLUDED_LOCAL_ASSET_NAMES.has(normalized)) {
    return true;
  }

  // Prevent accidental rotation of frame/backplate/support assets.
  return normalized.includes("backplate") || normalized.includes("frame");
}

async function getYouthTvLocalAssetItems(maxItems) {
  let entries = [];
  try {
    entries = await readdir(YOUTH_TV_ASSET_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  if (!files.length) {
    return [];
  }

  const items = await Promise.all(
    files.map(async (fileName) => {
      if (isExcludedLocalAsset(fileName)) {
        return null;
      }

      const extension = path.extname(fileName).toLowerCase();
      const isVideo = VIDEO_EXTENSIONS.has(extension);
      const isPhoto = PHOTO_EXTENSIONS.has(extension);
      if (!isVideo && !isPhoto) {
        return null;
      }

      const fullPath = path.join(YOUTH_TV_ASSET_DIR, fileName);
      const fileStat = await stat(fullPath).catch(() => null);
      const sortAt = Number.isFinite(fileStat?.mtimeMs) ? fileStat.mtimeMs : 0;

      return {
        id: `local-${fileName}`,
        kind: isVideo ? "video" : "photo",
        src: buildPublicAssetPath(fileName),
        caption: toAssetCaption(fileName) || "LC Youth",
        sortAt,
      };
    }),
  );

  return items
    .filter(Boolean)
    .sort((left, right) => right.sortAt - left.sortAt)
    .slice(0, maxItems);
}

export async function getYouthTvMediaItems(options = {}) {
  const maxAlbums = Number.parseInt(String(options.maxAlbums ?? DEFAULT_MAX_ALBUMS), 10) || DEFAULT_MAX_ALBUMS;
  const maxItems = Number.parseInt(String(options.maxItems ?? DEFAULT_MAX_ITEMS), 10) || DEFAULT_MAX_ITEMS;

  // Temporary content source: local youth TV folder in /public/assets/lc_youth_tv
  const localAssetItems = await getYouthTvLocalAssetItems(maxItems);
  if (localAssetItems.length) {
    return localAssetItems;
  }

  const albums = await getYouthEventAlbums(maxAlbums);
  const selectedAlbumIds = albums.slice(0, maxAlbums).map((album) => album.id);
  const bundles = await Promise.all(
    selectedAlbumIds.map((albumId) => getYouthEventAlbumById(albumId)),
  );

  const seen = new Set();
  const media = [];

  for (const bundle of bundles) {
    const photos = Array.isArray(bundle?.photos) ? bundle.photos : [];
    const videos = Array.isArray(bundle?.videos) ? bundle.videos : [];

    for (const photo of photos) {
      pushUniqueMedia(media, seen, {
        id: `photo-${photo.id}`,
        kind: "photo",
        src: String(photo.photoUrl || "").trim(),
        caption: String(photo.caption || "").trim(),
        sortAt: toSortableTimestamp(photo.takenOn || photo.createdAt),
      });
    }

    for (const video of videos) {
      const isDirectVideo = Boolean(video.isDirectVideo && video.videoUrl);
      const embedUrl = String(video.embedUrl || "").trim();
      const directUrl = String(video.videoUrl || "").trim();
      const kind = isDirectVideo ? "video" : embedUrl ? "embed" : "";
      const src = isDirectVideo ? directUrl : embedUrl;

      if (!kind || !src) {
        continue;
      }

      pushUniqueMedia(media, seen, {
        id: `video-${video.id}`,
        kind,
        src,
        poster: String(video.thumbnailUrl || "").trim(),
        caption: String(video.title || "").trim(),
        sortAt: toSortableTimestamp(video.recordedOn || video.createdAt),
      });
    }
  }

  media.sort((left, right) => right.sortAt - left.sortAt);

  if (!media.length) {
    return [
      {
        id: "fallback-youth-tv",
        kind: "photo",
        src: "/assets/youth-backdrop.png",
        caption: "LC Youth",
        sortAt: 0,
      },
    ];
  }

  return media.slice(0, maxItems);
}

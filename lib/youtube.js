const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

const BLOCKED_VIDEO_IDS = new Set([
  "dQw4w9WgXcQ",
  "oHg5SJYRHA0",
  "xvFZjo5PgG0",
  "QB7ACr7pUuE",
  "j5a0jTc9S10",
]);

function cleanString(value) {
  return String(value || "").trim();
}

export function parseYouTubeVideoId(input) {
  const raw = cleanString(input);
  if (!raw) {
    return "";
  }

  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) {
        return v;
      }
      const pathId = url.pathname.split("/").filter(Boolean).at(-1) || "";
      if (/^[A-Za-z0-9_-]{11}$/.test(pathId)) {
        return pathId;
      }
    }
    if (url.hostname === "youtu.be") {
      const shortId = url.pathname.replace("/", "");
      if (/^[A-Za-z0-9_-]{11}$/.test(shortId)) {
        return shortId;
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function toYouTubeEmbedUrl(input) {
  const id = parseYouTubeVideoId(input);
  if (!id) {
    return "";
  }
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

function isBlockedVideo(videoId, title = "", description = "") {
  if (BLOCKED_VIDEO_IDS.has(videoId)) {
    return true;
  }
  const text = `${title} ${description}`.toLowerCase();
  return (
    text.includes("rick astley") ||
    text.includes("never gonna give you up") ||
    text.includes("rickroll") ||
    text.includes("rick roll")
  );
}

async function fetchYouTubeJSON(endpoint, apiKey) {
  const url = `${YOUTUBE_BASE_URL}${endpoint}&key=${apiKey}`;
  const response = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function getChannelRecentVideos({
  apiKey,
  channelId,
  maxResults = 24,
} = {}) {
  if (!apiKey || !channelId) {
    return [];
  }

  const data = await fetchYouTubeJSON(
    `/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}`,
    apiKey,
  );

  if (!data?.items?.length) {
    return [];
  }

  return data.items
    .map((item) => {
      const videoId = item?.id?.videoId || "";
      const title = cleanString(item?.snippet?.title);
      const description = cleanString(item?.snippet?.description);
      return {
        id: videoId,
        title,
        description,
        publishedAt: item?.snippet?.publishedAt || null,
        thumbnail:
          item?.snippet?.thumbnails?.high?.url ||
          item?.snippet?.thumbnails?.medium?.url ||
          item?.snippet?.thumbnails?.default?.url ||
          "",
      };
    })
    .filter((video) => video.id && video.title && !isBlockedVideo(video.id, video.title, video.description));
}

export async function getCurrentLiveVideo({ apiKey, channelId } = {}) {
  if (!apiKey || !channelId) {
    return null;
  }

  const data = await fetchYouTubeJSON(
    `/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1`,
    apiKey,
  );

  const item = data?.items?.[0];
  if (!item?.id?.videoId) {
    return null;
  }

  const videoId = item.id.videoId;
  if (isBlockedVideo(videoId, item?.snippet?.title, item?.snippet?.description)) {
    return null;
  }

  return {
    id: videoId,
    title: cleanString(item?.snippet?.title) || "Live Stream",
    embedUrl: toYouTubeEmbedUrl(videoId),
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getChannelRecentVideos,
  getCurrentLiveVideo,
  parseYouTubeVideoId,
  toYouTubeEmbedUrl,
} from "@/lib/youtube";

const DEFAULT_FALLBACK_STREAM_VIDEO = "/assets/stream_fallback_loop/stream_fall_back_loop.mp4";

const FALLBACK_MAIN_ANNOUNCEMENTS = [
  {
    id: "fallback-main",
    title: "Welcome to Liberty Church",
    body: "Join us this Sunday at 10:00 AM for worship and the Word.",
  },
];

const FALLBACK_MINISTRIES = [];

const FALLBACK_HIGHLIGHT_CARDS = [
  {
    id: "fallback-highlight",
    title: "Welcome to Liberty Church",
    body: "Join us this Sunday at 10:00 AM. We are saving a seat for you and your family.",
    media_url: "",
    media_type: "",
    cta_label: "",
    cta_url: "",
    display_seconds: 12,
    enable_audio: false,
    volume_percent: 25,
  },
];

const FALLBACK_YOUTH_ANNOUNCEMENTS = [
  {
    id: "fallback-youth",
    title: "Youth Gathering",
    body: "Youth service happens every Wednesday at 6:30 PM.",
  },
];

const FALLBACK_YOUTH_SCRIPTURE = {
  reference: "1 Timothy 4:12",
  verse_text:
    "Do not let anyone look down on you because you are young, but set an example for the believers.",
};

const FALLBACK_MEMBER_SCRIPTURE = {
  reference: "Colossians 3:16",
  verse_text:
    "Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another.",
};

const FALLBACK_YOUTH_BANNER = {
  title: "Liberty Youth",
  subtitle: "A place for students to encounter Jesus and build bold faith.",
  image_url: "",
  cta_label: "Plan a Visit",
  cta_url: "/visit",
};

const FALLBACK_YOUTH_EVENT_ALBUMS = [
  {
    id: "fallback-youth-night-2025-01-02",
    title: "Youth Night",
    albumDate: "2025-01-02",
    description: "Photos and videos from Youth Night.",
    coverPhotoUrl: "/assets/youth-backdrop.png",
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "fallback-youth-worship-2025-01-09",
    title: "Worship and Prayer",
    albumDate: "2025-01-09",
    description: "Moments from student worship and prayer night.",
    coverPhotoUrl: "/assets/youth-backdrop.png",
    createdAt: "2025-01-09T00:00:00.000Z",
  },
  {
    id: "fallback-youth-outreach-2025-01-16",
    title: "Youth Outreach",
    albumDate: "2025-01-16",
    description: "Community outreach highlights from the youth team.",
    coverPhotoUrl: "/assets/youth-backdrop.png",
    createdAt: "2025-01-16T00:00:00.000Z",
  },
  {
    id: "fallback-youth-small-groups-2025-01-23",
    title: "Small Groups",
    albumDate: "2025-01-23",
    description: "Discipleship and discussion group recap.",
    coverPhotoUrl: "/assets/youth-backdrop.png",
    createdAt: "2025-01-23T00:00:00.000Z",
  },
  {
    id: "fallback-youth-serve-day-2025-01-30",
    title: "Serve Day",
    albumDate: "2025-01-30",
    description: "Photo and video recap from youth serve day.",
    coverPhotoUrl: "/assets/youth-backdrop.png",
    createdAt: "2025-01-30T00:00:00.000Z",
  },
];

const FALLBACK_YOUTH_EVENT_PHOTOS = [
  {
    id: "fallback-youth-night-photo-1",
    albumId: "fallback-youth-night-2025-01-02",
    photoUrl: "/assets/youth-backdrop.png",
    caption: "Youth Night",
    takenOn: "2025-01-02",
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "fallback-youth-worship-photo-1",
    albumId: "fallback-youth-worship-2025-01-09",
    photoUrl: "/assets/youth-backdrop.png",
    caption: "Worship and Prayer",
    takenOn: "2025-01-09",
    createdAt: "2025-01-09T00:00:00.000Z",
  },
  {
    id: "fallback-youth-outreach-photo-1",
    albumId: "fallback-youth-outreach-2025-01-16",
    photoUrl: "/assets/youth-backdrop.png",
    caption: "Youth Outreach",
    takenOn: "2025-01-16",
    createdAt: "2025-01-16T00:00:00.000Z",
  },
  {
    id: "fallback-youth-groups-photo-1",
    albumId: "fallback-youth-small-groups-2025-01-23",
    photoUrl: "/assets/youth-backdrop.png",
    caption: "Small Groups",
    takenOn: "2025-01-23",
    createdAt: "2025-01-23T00:00:00.000Z",
  },
  {
    id: "fallback-youth-serve-photo-1",
    albumId: "fallback-youth-serve-day-2025-01-30",
    photoUrl: "/assets/youth-backdrop.png",
    caption: "Serve Day",
    takenOn: "2025-01-30",
    createdAt: "2025-01-30T00:00:00.000Z",
  },
];

const FALLBACK_YOUTH_EVENT_VIDEOS = [
  {
    id: "fallback-youth-night-video-1",
    title: "Youth Night Recap",
    description: "Recap video from Youth Night.",
    videoUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    thumbnailUrl: "/assets/youth-backdrop.png",
    recordedOn: "2025-01-02",
    createdAt: "2025-01-02T00:00:00.000Z",
    embedUrl: "",
    watchUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    isDirectVideo: true,
  },
  {
    id: "fallback-youth-worship-video-1",
    title: "Worship and Prayer Recap",
    description: "Worship and prayer night recap.",
    videoUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    thumbnailUrl: "/assets/youth-backdrop.png",
    recordedOn: "2025-01-09",
    createdAt: "2025-01-09T00:00:00.000Z",
    embedUrl: "",
    watchUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    isDirectVideo: true,
  },
  {
    id: "fallback-youth-outreach-video-1",
    title: "Youth Outreach Recap",
    description: "Outreach recap.",
    videoUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    thumbnailUrl: "/assets/youth-backdrop.png",
    recordedOn: "2025-01-16",
    createdAt: "2025-01-16T00:00:00.000Z",
    embedUrl: "",
    watchUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    isDirectVideo: true,
  },
  {
    id: "fallback-youth-groups-video-1",
    title: "Small Groups Recap",
    description: "Small groups recap.",
    videoUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    thumbnailUrl: "/assets/youth-backdrop.png",
    recordedOn: "2025-01-23",
    createdAt: "2025-01-23T00:00:00.000Z",
    embedUrl: "",
    watchUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    isDirectVideo: true,
  },
  {
    id: "fallback-youth-serve-video-1",
    title: "Serve Day Recap",
    description: "Serve day recap.",
    videoUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    thumbnailUrl: "/assets/youth-backdrop.png",
    recordedOn: "2025-01-30",
    createdAt: "2025-01-30T00:00:00.000Z",
    embedUrl: "",
    watchUrl: DEFAULT_FALLBACK_STREAM_VIDEO,
    isDirectVideo: true,
  },
];

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function nowIsoString() {
  return new Date().toISOString();
}

function normalizeAnnouncements(items) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    startsAt: item.starts_at || null,
    createdAt: item.created_at || null,
  }));
}

function normalizeDateOnly(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function normalizeYouthEventAlbums(items) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  return items.map((item) => ({
    id: item.id,
    title: String(item.title || "").trim() || "Youth Event",
    albumDate: item.album_date || null,
    description: String(item.description || "").trim(),
    coverPhotoUrl: String(item.cover_photo_url || "").trim(),
    createdAt: item.created_at || null,
  }));
}

function normalizeYouthEventPhotos(items) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  return items.map((item) => ({
    id: item.id,
    albumId: item.album_id,
    photoUrl: String(item.photo_url || "").trim(),
    caption: String(item.caption || "").trim(),
    takenOn: item.taken_on || null,
    createdAt: item.created_at || null,
  }));
}

function isDirectVideoUrl(value) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(value || "").trim());
}

function normalizeYouthEventVideos(items) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  return items.map((item) => {
    const videoUrl = String(item.video_url || "").trim();
    const thumbnailUrl = String(item.thumbnail_url || "").trim();
    const videoId = parseYouTubeVideoId(videoUrl);
    const embedUrl = toYouTubeEmbedUrl(videoId);
    const directVideo = isDirectVideoUrl(videoUrl);

    return {
      id: item.id,
      title: String(item.title || "").trim() || "Event Video",
      description: String(item.description || "").trim(),
      videoUrl,
      thumbnailUrl,
      recordedOn: item.recorded_on || null,
      createdAt: item.created_at || null,
      embedUrl,
      watchUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoUrl,
      isDirectVideo: directVideo,
    };
  });
}

function pickVideosForAlbum(videos, album) {
  if (!Array.isArray(videos) || !videos.length || !album) {
    return [];
  }

  const albumDate = normalizeDateOnly(album.albumDate || album.createdAt);
  const albumTitle = String(album.title || "").toLowerCase();

  let filtered = [];
  if (albumDate) {
    filtered = videos.filter((item) => normalizeDateOnly(item.recordedOn || item.createdAt) === albumDate);
  }

  if (!filtered.length && albumTitle) {
    const titleTokens = albumTitle
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4);

    if (titleTokens.length) {
      filtered = videos.filter((item) => {
        const haystack = `${item.title} ${item.description}`.toLowerCase();
        return titleTokens.some((token) => haystack.includes(token));
      });
    }
  }

  return filtered.length ? filtered.slice(0, 12) : videos.slice(0, 12);
}

async function getAnnouncementsByCategory(supabase, category, limit = 8) {
  if (!supabase) {
    return [];
  }

  const now = nowIsoString();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, starts_at, created_at")
    .eq("category", category)
    .eq("is_published", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    return [];
  }

  return normalizeAnnouncements(data);
}

async function getHomepageMinistries(supabase, limit = 12) {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("ministries")
    .select("id, title, body")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return normalizeAnnouncements(data);
}

async function getHomepageSeasonalFeature(supabase) {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("seasonal_features")
    .select(
      "id, title, body, media_url, media_type, cta_label, cta_url, season_tag, starts_at, ends_at, sort_order, is_active, display_seconds, enable_audio, volume_percent, created_at",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data?.length) {
    return [];
  }

  const now = Date.now();
  const activeByWindow = data.filter((item) => {
    const startsAt = item?.starts_at ? new Date(item.starts_at).getTime() : null;
    const endsAt = item?.ends_at ? new Date(item.ends_at).getTime() : null;
    if (startsAt && Number.isFinite(startsAt) && startsAt > now) {
      return false;
    }
    if (endsAt && Number.isFinite(endsAt) && endsAt < now) {
      return false;
    }
    return true;
  });

  return activeByWindow.map((item) => ({
    id: item.id,
    title: String(item.title || "").trim(),
    body: String(item.body || "").trim(),
    media_url: String(item.media_url || "").trim(),
    media_type: String(item.media_type || "").trim().toLowerCase(),
    cta_label: String(item.cta_label || "").trim(),
    cta_url: String(item.cta_url || "").trim(),
    display_seconds: Math.min(Math.max(Number.parseInt(String(item.display_seconds ?? 12), 10) || 12, 5), 120),
    enable_audio: Boolean(item.enable_audio),
    volume_percent: Math.min(Math.max(Number.parseInt(String(item.volume_percent ?? 25), 10) || 25, 0), 100),
  }));
}

async function getScriptureByAudience(supabase, audience) {
  if (!supabase) {
    return null;
  }

  const today = todayDateString();
  const withAudience = await supabase
    .from("scriptures")
    .select("reference, verse_text")
    .eq("audience", audience)
    .eq("is_published", true)
    .lte("week_start", today)
    .gte("week_end", today)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!withAudience.error && withAudience.data) {
    return withAudience.data;
  }

  // Backward compatibility if `audience` has not been added yet.
  const withoutAudience = await supabase
    .from("scriptures")
    .select("reference, verse_text")
    .eq("is_published", true)
    .lte("week_start", today)
    .gte("week_end", today)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (withoutAudience.error || !withoutAudience.data) {
    return null;
  }

  return withoutAudience.data;
}

async function getYouthBanner(supabase) {
  if (!supabase) {
    return null;
  }

  const now = nowIsoString();
  const { data, error } = await supabase
    .from("youth_banners")
    .select("title, subtitle, image_url, cta_label, cta_url")
    .eq("is_active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getLatestActiveLivestreamRecord(supabase) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("livestreams")
    .select("title, embed_url, fallback_video_url, watch_cta_label, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getLivestreamContent() {
  const supabase = await createSupabaseServerClient();
  const fallbackVideoUrl =
    process.env.NEXT_PUBLIC_FALLBACK_STREAM_VIDEO_URL || DEFAULT_FALLBACK_STREAM_VIDEO;
  const fallbackNote = "We are not currently streaming live. Join us Sundays at 10:00 AM.";
  const liveYoutubeApiKey =
    process.env.SUPABASE_NEW_LIVE_KEY || process.env.YOUTUBE_API_KEY || "";
  const manualOverrideEnabled = process.env.LIVE_MANUAL_OVERRIDE_ENABLED === "true";

  const [supabaseStream, youtubeLive] = await Promise.all([
    getLatestActiveLivestreamRecord(supabase),
    getCurrentLiveVideo({
      apiKey: liveYoutubeApiKey,
      channelId: process.env.YOUTUBE_CHANNEL_ID,
    }),
  ]);

  // Optional manual override only when explicitly enabled.
  if (manualOverrideEnabled && supabaseStream?.embed_url) {
    return {
      title: supabaseStream.title || "Live Stream",
      isLive: true,
      liveEmbedUrl: supabaseStream.embed_url,
      fallbackVideoUrl: supabaseStream.fallback_video_url || fallbackVideoUrl,
      watchCtaLabel: supabaseStream.watch_cta_label || "Watch Live Now",
      note: fallbackNote,
    };
  }

  if (youtubeLive?.embedUrl) {
    return {
      title: youtubeLive.title,
      isLive: true,
      liveEmbedUrl: youtubeLive.embedUrl,
      fallbackVideoUrl,
      watchCtaLabel: "Watch Live Now",
      note: fallbackNote,
    };
  }

  return {
    title: "Live Stream",
    isLive: false,
    liveEmbedUrl: "",
    fallbackVideoUrl: supabaseStream?.fallback_video_url || fallbackVideoUrl,
    watchCtaLabel: supabaseStream?.watch_cta_label || "Watch Live Now",
    note: fallbackNote,
  };
}

export async function getHomepageContent() {
  const supabase = await createSupabaseServerClient();

  const [announcements, ministries, seasonalFeature, livestream, memberScripture] = await Promise.all([
    getAnnouncementsByCategory(supabase, "main", 8),
    getHomepageMinistries(supabase, 12),
    getHomepageSeasonalFeature(supabase),
    getLivestreamContent(),
    getScriptureByAudience(supabase, "member"),
  ]);

  return {
    announcements: announcements.length ? announcements : FALLBACK_MAIN_ANNOUNCEMENTS,
    ministries: ministries.length ? ministries : FALLBACK_MINISTRIES,
    highlightCards: seasonalFeature.length ? seasonalFeature : FALLBACK_HIGHLIGHT_CARDS,
    livestream,
    memberScripture: memberScripture || FALLBACK_MEMBER_SCRIPTURE,
  };
}

export async function getYouthPageContent() {
  const supabase = await createSupabaseServerClient();

  const [announcements, scripture, banner] = await Promise.all([
    getAnnouncementsByCategory(supabase, "youth", 8),
    getScriptureByAudience(supabase, "youth"),
    getYouthBanner(supabase),
  ]);

  return {
    youthAnnouncements: announcements.length ? announcements : FALLBACK_YOUTH_ANNOUNCEMENTS,
    youthScripture: scripture || FALLBACK_YOUTH_SCRIPTURE,
    youthBanner: banner || FALLBACK_YOUTH_BANNER,
  };
}

export async function getYouthEventAlbums(limit = 24) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return FALLBACK_YOUTH_EVENT_ALBUMS;
  }

  const { data, error } = await supabase
    .from("photo_albums")
    .select("id, title, album_date, description, cover_photo_url, created_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("album_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data) || !data.length) {
    return FALLBACK_YOUTH_EVENT_ALBUMS;
  }

  const normalized = normalizeYouthEventAlbums(data);
  if (!normalized.length) {
    return FALLBACK_YOUTH_EVENT_ALBUMS;
  }

  if (normalized.length >= 5) {
    return normalized;
  }

  const usedIds = new Set(normalized.map((item) => item.id));
  const filler = FALLBACK_YOUTH_EVENT_ALBUMS.filter((item) => !usedIds.has(item.id)).slice(0, 5 - normalized.length);
  return [...normalized, ...filler];
}

export async function getYouthEventAlbumById(albumId) {
  const normalizedId = String(albumId || "").trim();
  if (!normalizedId) {
    return null;
  }

  const fallbackAlbum = FALLBACK_YOUTH_EVENT_ALBUMS.find((item) => item.id === normalizedId) || null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    if (!fallbackAlbum) {
      return null;
    }
    return {
      album: fallbackAlbum,
      photos: FALLBACK_YOUTH_EVENT_PHOTOS.filter((item) => item.albumId === fallbackAlbum.id),
      videos: FALLBACK_YOUTH_EVENT_VIDEOS,
    };
  }

  const [albumResult, photosResult, videosResult] = await Promise.all([
    supabase
      .from("photo_albums")
      .select("id, title, album_date, description, cover_photo_url, created_at")
      .eq("id", normalizedId)
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("album_photos")
      .select("id, album_id, photo_url, caption, taken_on, created_at")
      .eq("album_id", normalizedId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("taken_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("gallery_videos")
      .select("id, title, video_url, thumbnail_url, description, recorded_on, created_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("recorded_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (albumResult.error || !albumResult.data) {
    if (!fallbackAlbum) {
      return null;
    }
    return {
      album: fallbackAlbum,
      photos: FALLBACK_YOUTH_EVENT_PHOTOS.filter((item) => item.albumId === fallbackAlbum.id),
      videos: FALLBACK_YOUTH_EVENT_VIDEOS,
    };
  }

  const normalizedAlbums = normalizeYouthEventAlbums([albumResult.data]);
  const album = normalizedAlbums[0] || null;
  if (!album) {
    return null;
  }

  const photos = photosResult.error ? [] : normalizeYouthEventPhotos(photosResult.data || []);
  const videos = videosResult.error ? [] : normalizeYouthEventVideos(videosResult.data || []);
  const albumVideos = pickVideosForAlbum(videos, album);

  return {
    album,
    photos,
    videos: albumVideos,
  };
}

export async function getMemberAnnouncementsContent(limit = 24) {
  const supabase = await createSupabaseServerClient();
  return await getAnnouncementsByCategory(supabase, "main", limit);
}

export async function getMemberAnnouncementById(announcementId) {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !announcementId) {
    return null;
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, starts_at, created_at")
    .eq("id", announcementId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeAnnouncements([data])[0] || null;
}

function normalizeYoutubeVideo(video) {
  const embedUrl = toYouTubeEmbedUrl(video.id);
  return {
    id: video.id,
    title: video.title || "Untitled Sermon",
    description: video.description || "",
    publishedAt: video.publishedAt || null,
    thumbnail: video.thumbnail || "",
    embedUrl,
    watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
  };
}

function normalizeDbSermon(sermon) {
  const videoId = parseYouTubeVideoId(sermon.video_url || "");
  return {
    id: sermon.id,
    title: sermon.title || "Untitled Sermon",
    description: "",
    publishedAt: sermon.preached_on || sermon.created_at || null,
    thumbnail: "",
    embedUrl: toYouTubeEmbedUrl(videoId),
    watchUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : "",
  };
}

export async function getSermonsContent() {
  const supabase = await createSupabaseServerClient();
  const sermonsYoutubeApiKey =
    process.env.SUPABASE_NEW_SERMONS_KEY || process.env.YOUTUBE_API_KEY || "";

  const youtubeVideos = await getChannelRecentVideos({
    apiKey: sermonsYoutubeApiKey,
    channelId: process.env.YOUTUBE_CHANNEL_ID,
    maxResults: 24,
  });

  if (youtubeVideos.length) {
    const videos = youtubeVideos.map(normalizeYoutubeVideo).filter((item) => item.embedUrl);
    return {
      source: "youtube",
      videos,
    };
  }

  if (supabase) {
    const { data, error } = await supabase
      .from("sermons")
      .select("id, title, video_url, preached_on, created_at")
      .eq("is_published", true)
      .order("preached_on", { ascending: false })
      .limit(24);

    if (!error && data?.length) {
      const videos = data.map(normalizeDbSermon).filter((item) => item.embedUrl);
      if (videos.length) {
        return {
          source: "supabase",
          videos,
        };
      }
    }
  }

  return {
    source: "empty",
    videos: [],
  };
}

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

const FALLBACK_YOUTH_BANNER = {
  title: "Liberty Youth",
  subtitle: "A place for students to encounter Jesus and build bold faith.",
  image_url: "",
  cta_label: "Plan a Visit",
  cta_url: "/visit",
};

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
  }));
}

async function getAnnouncementsByCategory(supabase, category, limit = 8) {
  if (!supabase) {
    return [];
  }

  const now = nowIsoString();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body")
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
  const supabase = createSupabaseServerClient();
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
  const supabase = createSupabaseServerClient();

  const [announcements, ministries, seasonalFeature, livestream] = await Promise.all([
    getAnnouncementsByCategory(supabase, "main", 8),
    getHomepageMinistries(supabase, 12),
    getHomepageSeasonalFeature(supabase),
    getLivestreamContent(),
  ]);

  return {
    announcements: announcements.length ? announcements : FALLBACK_MAIN_ANNOUNCEMENTS,
    ministries: ministries.length ? ministries : FALLBACK_MINISTRIES,
    highlightCards: seasonalFeature.length ? seasonalFeature : FALLBACK_HIGHLIGHT_CARDS,
    livestream,
  };
}

export async function getYouthPageContent() {
  const supabase = createSupabaseServerClient();

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
  const supabase = createSupabaseServerClient();
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

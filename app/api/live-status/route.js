import { NextResponse } from "next/server";
import { getLivestreamContent } from "@/lib/content";

let cachedStatus = null;
let cacheExpiresAt = 0;

function cacheDurationMs() {
  const parsed = Number.parseInt(process.env.LIVE_STATUS_CACHE_MS || "30000", 10);
  if (!Number.isFinite(parsed) || parsed < 5000) {
    return 30000;
  }
  return parsed;
}

export async function GET() {
  const now = Date.now();

  if (cachedStatus && now < cacheExpiresAt) {
    return NextResponse.json({
      ...cachedStatus,
      cache: "hit",
    });
  }

  const livestream = await getLivestreamContent();
  const payload = {
    isLive: Boolean(livestream.isLive),
    source: livestream.source || "offline",
    title: livestream.title || "Live Stream",
    liveEmbedUrl: livestream.liveEmbedUrl || "",
    fallbackVideoUrl: livestream.fallbackVideoUrl || "",
    note: livestream.note || "",
    checkedAt: new Date().toISOString(),
  };

  cachedStatus = payload;
  cacheExpiresAt = now + cacheDurationMs();

  return NextResponse.json({
    ...payload,
    cache: "miss",
  });
}

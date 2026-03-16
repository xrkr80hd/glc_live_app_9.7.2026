function normalizeOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }

  return `https://${raw.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

export function getPublicSiteOrigin(request) {
  const explicitOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (explicitOrigin) {
    return normalizeOrigin(explicitOrigin);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return normalizeOrigin(vercelUrl);
  }

  return normalizeOrigin(new URL(request.url).origin);
}

export function buildPublicUrl(request, path) {
  return new URL(path, getPublicSiteOrigin(request));
}

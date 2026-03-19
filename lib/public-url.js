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

function resolveExplicitOrigin() {
  const explicitOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (explicitOrigin) {
    return normalizeOrigin(explicitOrigin);
  }

  return "";
}

function resolveVercelProjectOrigin() {
  const projectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!projectUrl) {
    return "";
  }

  return normalizeOrigin(projectUrl);
}

export function getPublicSiteOrigin(request) {
  const explicitOrigin = resolveExplicitOrigin();
  if (explicitOrigin) {
    return explicitOrigin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
  }

  const vercelOrigin = resolveVercelProjectOrigin();
  if (vercelOrigin) {
    return vercelOrigin;
  }

  return normalizeOrigin(new URL(request.url).origin);
}

export function buildPublicUrl(request, path) {
  return new URL(path, getPublicSiteOrigin(request));
}

export function getAuthSiteOrigin(request) {
  const explicitOrigin = resolveExplicitOrigin();
  if (explicitOrigin) {
    return explicitOrigin;
  }

  // Keep auth links stable across preview deployments unless env is overridden.
  return "https://golibertychurch-app.vercel.app";
}

export function buildAuthUrl(request, path) {
  return new URL(path, getAuthSiteOrigin(request));
}

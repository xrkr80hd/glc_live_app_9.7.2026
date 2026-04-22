/** @type {import('next').NextConfig} */
const distDir = String(process.env.NEXT_DIST_DIR || "").trim();

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(distDir ? { distDir } : {}),
};

export default nextConfig;

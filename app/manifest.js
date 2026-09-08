export default function manifest() {
  return {
    name: "Liberty Church",
    short_name: "Liberty Church",
    description: "Liberty Church public website and member experience",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8f4",
    theme_color: "#0f6048",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

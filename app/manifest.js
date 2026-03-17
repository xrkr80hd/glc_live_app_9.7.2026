export default function manifest() {
  return {
    name: "Liberty Church Member Beta",
    short_name: "Liberty Beta",
    description: "Liberty Church member beta build",
    start_url: "/member",
    display: "standalone",
    background_color: "#f7f8f4",
    theme_color: "#0f6048",
    orientation: "portrait",
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

import Script from "next/script";
import { Manrope, Sora } from "next/font/google";
import { PwaRuntime } from "@/components/PwaRuntime";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "Liberty Church | Alexandria, LA",
  description: "A thriving Spirit-filled church in Alexandria, LA. Join us Sundays for worship and the Word.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Liberty Church",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/style.css" />
        <meta name="theme-color" content="#1F4D3A" />
      </head>
      <body className={`${manrope.variable} ${sora.variable}`}>
        {children}
        <PwaRuntime />
        <Script src="/assets/site.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}

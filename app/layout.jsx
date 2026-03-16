import Script from "next/script";
import { Manrope, Sora } from "next/font/google";
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
  title: "Liberty Church",
  description: "Unified Liberty Church website and member app frontend.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/style.css" />
        <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${manrope.variable} ${sora.variable}`}>
        {children}
        <Script src="/assets/site.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}

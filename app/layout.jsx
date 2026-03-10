import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Liberty Church | Alexandria, LA",
  description:
    "A thriving Spirit-filled church in Alexandria, LA. Join us Sundays for worship and the Word.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/style.css" />
        <link rel="stylesheet" href="/assets/live-indicator.css" />
        <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        {children}
        <Script src="/assets/site.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}

import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";

export const metadata = {
  title: "Liberty Church | Alexandria, LA",
  description:
    "A Spirit-filled church in Alexandria, Louisiana. Join us Sundays for worship and the Word.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <SiteNav />
          <main className="site-main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

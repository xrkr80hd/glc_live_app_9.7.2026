import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:3000";
const edgePath = process.env.EDGE_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("artifacts/screenshots");

const routes = [
  { slug: "01-home", label: "Home", route: "/" },
  { slug: "02-announcements", label: "Announcements", route: "/announcements" },
  { slug: "03-announcement-detail", label: "Announcement Detail", route: "/announcements/announcement-1" },
  { slug: "04-live", label: "Watch Live", route: "/live" },
  { slug: "05-sermons", label: "Sermons", route: "/sermons" },
  { slug: "06-prayer", label: "Prayer", route: "/prayer" },
  {
    slug: "07-prayer-toast",
    label: "Prayer Toast",
    route: "/prayer",
    prepare: async (page) => {
      await page.fill("#prayer-request-text", "[PRAYER_REQUEST_TEXT]");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(300);
    },
  },
  { slug: "08-prayer-wall", label: "Prayer Wall", route: "/prayer/wall" },
  { slug: "09-more", label: "More", route: "/more" },
  { slug: "10-give", label: "Give", route: "/give" },
  { slug: "11-beliefs", label: "Beliefs", route: "/beliefs" },
  { slug: "12-youth", label: "Youth", route: "/youth" },
  { slug: "13-youth-devotional", label: "Youth Devotional", route: "/youth/devotional" },
  { slug: "14-youth-event", label: "Youth Event", route: "/youth/event" },
  { slug: "15-profile", label: "Profile", route: "/profile" },
  { slug: "16-edit-profile", label: "Edit Profile", route: "/profile/edit" },
  { slug: "17-change-password", label: "Change Password", route: "/profile/change-password" },
  { slug: "18-directory", label: "Church Directory", route: "/directory" },
  { slug: "19-settings", label: "Settings", route: "/settings" },
  {
    slug: "20-announcement-notifications",
    label: "Announcement Notifications",
    route: "/settings/announcement-notifications",
  },
  {
    slug: "21-notification-preferences",
    label: "Notification Preferences",
    route: "/settings/preferences",
  },
  { slug: "22-admin-prayer-approval", label: "Admin Prayer Approval", route: "/admin/prayer-approval" },
];

function buildGallery(items) {
  const cards = items
    .map(
      (item) => `
        <article class="card">
          <h2>${item.label}</h2>
          <p><strong>Route:</strong> ${item.route}</p>
          <p><strong>Resolved URL:</strong> ${item.finalUrl}</p>
          <img src="${item.fileName}" alt="${item.label} screenshot" />
        </article>
      `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Liberty Church Mobile App Screenshots</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, sans-serif;
        background: #eff3ef;
        color: #142019;
      }
      h1 {
        margin-top: 0;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }
      .card {
        background: #ffffff;
        border: 1px solid #d2ddd4;
        border-radius: 18px;
        padding: 16px;
        box-shadow: 0 10px 30px rgba(20, 32, 25, 0.08);
      }
      .card h2 {
        margin: 0 0 8px;
        font-size: 18px;
      }
      .card p {
        margin: 0 0 8px;
        font-size: 13px;
        word-break: break-word;
      }
      .card img {
        width: 100%;
        border-radius: 14px;
        border: 1px solid #d2ddd4;
        background: #f8faf8;
      }
    </style>
  </head>
  <body>
    <h1>Liberty Church Mobile App Screenshots</h1>
    <p>Generated from ${baseUrl} using Microsoft Edge.</p>
    <div class="grid">${cards}</div>
  </body>
</html>`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
  });

  const results = [];

  try {
    for (const item of routes) {
      const context = await browser.newContext({
        viewport: { width: 430, height: 932 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();
      const targetUrl = new URL(item.route, baseUrl).toString();

      await page.goto(targetUrl, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);

      if (item.prepare) {
        await item.prepare(page);
      }

      const fileName = `${item.slug}.png`;
      const filePath = path.join(outputDir, fileName);
      await page.screenshot({ path: filePath, fullPage: true });

      results.push({
        label: item.label,
        route: item.route,
        finalUrl: page.url(),
        fileName,
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const gallery = buildGallery(results);
  await fs.writeFile(path.join(outputDir, "index.html"), gallery, "utf8");

  console.log(`Captured ${results.length} screenshots to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
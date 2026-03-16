import fs from "node:fs/promises";
import path from "node:path";

const anchorDir = path.resolve("D:/iCloudDrive/Desktop/Screen References/Screen Layout");
const workspaceAnchorDir = path.resolve("artifacts/anchors");
const screenshotDir = path.resolve("artifacts/screenshots");
const compareDir = path.resolve("artifacts/compare");

const mappings = [
  { label: "Home", anchor: "1. Home Screen.png", screenshot: "01-home.png", route: "/" },
  { label: "Announcements", anchor: "1.1 Announcments.png", screenshot: "02-announcements.png", route: "/announcements" },
  { label: "Announcement Detail", anchor: "1.1a Announcments Detail.png", screenshot: "03-announcement-detail.png", route: "/announcements/[id]" },
  { label: "Watch Live", anchor: "2. Watch Live.png", screenshot: "04-live.png", route: "/live" },
  { label: "Sermons", anchor: "3. Sermons.png", screenshot: "05-sermons.png", route: "/sermons" },
  { label: "Prayer", anchor: "4. Prayer.png", screenshot: "06-prayer.png", route: "/prayer" },
  { label: "Prayer Toast", anchor: "4.1 Prayer Toast.png", screenshot: "07-prayer-toast.png", route: "/prayer" },
  { label: "Prayer Wall", anchor: "4.2 Prayer Wall.png", screenshot: "08-prayer-wall.png", route: "/prayer/wall" },
  { label: "More", anchor: "5.More.png", screenshot: "09-more.png", route: "/more" },
  { label: "Give", anchor: "6.Give.png", screenshot: "10-give.png", route: "/give" },
  { label: "Beliefs", anchor: "7.Beliefs.png", screenshot: "11-beliefs.png", route: "/beliefs" },
  { label: "Youth", anchor: "8 Youth.png", screenshot: "12-youth.png", route: "/youth" },
  { label: "Youth Devotional", anchor: "8.1 Youth Devotional.png", screenshot: "13-youth-devotional.png", route: "/youth/devotional" },
  { label: "Youth Event", anchor: "8.1 Youth Event Card.png", screenshot: "14-youth-event.png", route: "/youth/event" },
  { label: "Profile", anchor: "9. Profile Screen.png", screenshot: "15-profile.png", route: "/profile" },
  { label: "Church Directory", anchor: "9.a Church Directory.png", screenshot: "18-directory.png", route: "/directory" },
  { label: "Settings", anchor: "10. Settings Screen.png", screenshot: "19-settings.png", route: "/settings" },
  {
    label: "Announcement Notifications",
    anchor: "10.1 Announcement Notifications.png",
    screenshot: "20-announcement-notifications.png",
    route: "/settings/announcement-notifications",
  },
  {
    label: "Notification Preferences",
    anchor: "10.1a Notificaion Preferences.png",
    screenshot: "21-notification-preferences.png",
    route: "/settings/preferences",
  },
  { label: "Edit Profile", anchor: "10.1b Edit Profile.png", screenshot: "16-edit-profile.png", route: "/profile/edit" },
  {
    label: "Change Password",
    anchor: "10.1c Change Password.png",
    screenshot: "17-change-password.png",
    route: "/profile/change-password",
  },
  {
    label: "Admin Prayer Approval",
    anchor: "11. Admin _ Moderator Tools Prayer Wall Approval.png",
    screenshot: "22-admin-prayer-approval.png",
    route: "/admin/prayer-approval",
    note: "Current screenshot resolves to the login screen because the route is role-restricted.",
  },
];

function buildHtml(items) {
  const sections = items
    .map(
      (item) => `
        <article class="compare-card">
          <div class="compare-head">
            <div>
              <h2>${item.label}</h2>
              <p>${item.route}</p>
            </div>
            ${item.note ? `<div class="note">${item.note}</div>` : ""}
          </div>
          <div class="compare-grid">
            <section>
              <h3>Current App</h3>
              <img src="../screenshots/${item.screenshot}" alt="${item.label} current app screenshot" />
            </section>
            <section>
              <h3>Anchor</h3>
              <img src="../anchors/${encodeURIComponent(item.anchor)}" alt="${item.label} anchor screenshot" />
            </section>
          </div>
        </article>
      `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Liberty Church Compare Gallery</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, sans-serif;
        background: #edf2ed;
        color: #122019;
      }
      h1 {
        margin-top: 0;
      }
      .compare-wrap {
        display: grid;
        gap: 24px;
      }
      .compare-card {
        background: #ffffff;
        border: 1px solid #d7e0d8;
        border-radius: 20px;
        padding: 16px;
        box-shadow: 0 10px 30px rgba(18, 32, 25, 0.08);
      }
      .compare-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .compare-head h2 {
        margin: 0 0 6px;
        font-size: 20px;
      }
      .compare-head p {
        margin: 0;
        color: #516258;
      }
      .compare-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .compare-grid section {
        background: #f8fbf8;
        border: 1px solid #d7e0d8;
        border-radius: 16px;
        padding: 12px;
      }
      .compare-grid h3 {
        margin: 0 0 12px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      img {
        width: 100%;
        display: block;
        border-radius: 12px;
        border: 1px solid #d7e0d8;
        background: #ffffff;
      }
      .note {
        max-width: 360px;
        padding: 10px 12px;
        border-radius: 12px;
        background: #fff5df;
        color: #6b5320;
        font-size: 13px;
        line-height: 1.4;
      }
      @media (max-width: 900px) {
        .compare-grid {
          grid-template-columns: 1fr;
        }
        .compare-head {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <h1>Liberty Church Screen Compare Gallery</h1>
    <p>Current mobile app render on the left, uploaded anchor on the right.</p>
    <div class="compare-wrap">${sections}</div>
  </body>
</html>`;
}

async function copyAnchors() {
  await fs.mkdir(workspaceAnchorDir, { recursive: true });

  for (const item of mappings) {
    const source = path.join(anchorDir, item.anchor);
    const destination = path.join(workspaceAnchorDir, item.anchor);
    await fs.copyFile(source, destination);
  }
}

async function main() {
  await fs.mkdir(compareDir, { recursive: true });
  await copyAnchors();

  for (const item of mappings) {
    await fs.access(path.join(screenshotDir, item.screenshot));
  }

  const html = buildHtml(mappings);
  await fs.writeFile(path.join(compareDir, "index.html"), html, "utf8");

  console.log(`Built compare gallery in ${compareDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
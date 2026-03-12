"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconCalendarEvent,
  IconArchive,
  IconBible,
  IconBroadcast,
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconLogout2,
  IconMapPin,
  IconMenu2,
  IconMessageCircleHeart,
  IconMusic,
  IconPencil,
  IconPhoto,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconSpeakerphone,
  IconTrash,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import styles from "./AdminDashboard.module.css";

function getNowDateInput() {
  return new Date().toISOString().slice(0, 10);
}

function getNowDateTimeInput() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function formatDateTime(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "—";
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return date.toLocaleString();
}

function formatDate(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "—";
  }
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return date.toLocaleDateString();
}

function toDateInput(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

function toDateTimeInput(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

const CONTENT_RESOURCES = [
  {
    key: "announcements",
    label: "Announcements",
    singularLabel: "Announcement",
    description: "Homepage and youth announcements.",
    icon: IconSpeakerphone,
    listEndpoint: "/api/admin/announcements?include_unpublished=true&limit=120",
    createEndpoint: "/api/admin/announcements",
    itemEndpoint: (id) => `/api/admin/announcements/${id}`,
    listKey: "announcements",
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "main", label: "Main" },
          { value: "youth", label: "Youth" },
        ],
        required: true,
        defaultValue: "main",
      },
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Announcement title" },
      { name: "body", label: "Body", type: "textarea", required: true, placeholder: "Announcement details", rows: 5, fullWidth: true },
      { name: "starts_at", label: "Starts At", type: "datetime", defaultValue: () => getNowDateTimeInput() },
      { name: "ends_at", label: "Ends At", type: "datetime" },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: false },
    ],
    preview: [
      { label: "Category", name: "category" },
      { label: "Starts", name: "starts_at", format: formatDateTime },
      { label: "Ends", name: "ends_at", format: formatDateTime },
      { label: "Sort", name: "sort_order" },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "ministries",
    label: "Ministries & Service Times",
    singularLabel: "Ministry/Service Item",
    description: "Homepage ministry rows and service highlights. Fully editable from this panel.",
    icon: IconCalendarEvent,
    listEndpoint: "/api/admin/ministries?include_unpublished=true&limit=120",
    createEndpoint: "/api/admin/ministries",
    itemEndpoint: (id) => `/api/admin/ministries/${id}`,
    listKey: "ministries",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Men's Fellowship" },
      { name: "body", label: "Body", type: "textarea", required: true, placeholder: "Service time and details...", rows: 5, fullWidth: true },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Body", name: "body" },
      { label: "Sort", name: "sort_order" },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "team-roles",
    label: "Teams & Permissions",
    singularLabel: "Team Role",
    description: "Create roles like Media Team, Worship Team, FOH Sound, Children's, and Youth.",
    icon: IconUsersGroup,
    listEndpoint: "/api/admin/team-roles?include_inactive=true&limit=300",
    createEndpoint: "/api/admin/team-roles",
    itemEndpoint: (id) => `/api/admin/team-roles/${id}`,
    listKey: "teamRoles",
    fields: [
      { name: "name", label: "Role Name", type: "text", required: true, placeholder: "Media Team" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Optional description...", rows: 4, fullWidth: true },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_system", label: "System Role", type: "checkbox", defaultValue: false },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Role Key", name: "role_key" },
      { label: "Role Name", name: "name" },
      { label: "Sort", name: "sort_order" },
      { label: "System", name: "is_system" },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "team-members",
    label: "User Accounts",
    singularLabel: "Team Member",
    description: "Create member records and flag superusers.",
    icon: IconUsersGroup,
    listEndpoint: "/api/admin/team-members?include_inactive=true&limit=300",
    createEndpoint: "/api/admin/team-members",
    itemEndpoint: (id) => `/api/admin/team-members/${id}`,
    listKey: "teamMembers",
    fields: [
      { name: "username", label: "Username", type: "text", required: true, placeholder: "xrkr80hdadmin" },
      { name: "full_name", label: "Full Name", type: "text", placeholder: "Display name" },
      { name: "email", label: "Email", type: "text", placeholder: "name@example.com" },
      { name: "phone", label: "Phone", type: "text", placeholder: "(###) ###-####" },
      { name: "password", label: "Login Password", type: "password", placeholder: "Set password (min 8 chars)" },
      { name: "notes", label: "Notes", type: "textarea", placeholder: "Optional notes...", rows: 4, fullWidth: true },
      { name: "is_superuser", label: "Superuser", type: "checkbox", defaultValue: false },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Username", name: "username" },
      { label: "Name", name: "full_name" },
      { label: "Email", name: "email" },
      { label: "Superuser", name: "is_superuser" },
      { label: "Last Login", name: "last_login_at", format: formatDateTime },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "team-member-roles",
    label: "Team Access",
    singularLabel: "Role Assignment",
    description: "Assign multiple roles to each member and mark team-level admins.",
    icon: IconUsersGroup,
    listEndpoint: "/api/admin/team-member-roles?limit=400",
    createEndpoint: "/api/admin/team-member-roles",
    itemEndpoint: (id) => `/api/admin/team-member-roles/${id}`,
    listKey: "teamMemberRoles",
    fields: [
      {
        name: "member_id",
        label: "Team Member",
        type: "relation",
        relationResourceKey: "team-members",
        relationLabelKeys: ["full_name", "username", "email"],
        required: true,
        placeholderOptionLabel: "Select team member",
      },
      {
        name: "role_id",
        label: "Team Role",
        type: "relation",
        relationResourceKey: "team-roles",
        relationLabelKeys: ["name", "role_key"],
        required: true,
        placeholderOptionLabel: "Select team role",
      },
      { name: "is_role_admin", label: "Team Admin", type: "checkbox", defaultValue: false },
      { name: "assigned_at", label: "Assigned At", type: "datetime", defaultValue: () => getNowDateTimeInput() },
    ],
    preview: [
      { label: "Member", name: "member_label" },
      { label: "Role", name: "role_label" },
      { label: "Team Admin", name: "is_role_admin" },
      { label: "Assigned", name: "assigned_at", format: formatDateTime },
    ],
  },
  {
    key: "service-song-lists",
    label: "Service Song Lists",
    singularLabel: "Service Song List",
    description:
      "Plan sermon titles and song sets for FOH, worship, and media teams. Enter one song per line.",
    icon: IconMusic,
    listEndpoint: "/api/admin/service-song-lists?include_inactive=true&limit=300",
    createEndpoint: "/api/admin/service-song-lists",
    itemEndpoint: (id) => `/api/admin/service-song-lists/${id}`,
    listKey: "serviceSongLists",
    fields: [
      {
        name: "role_id",
        label: "Team",
        type: "relation",
        relationResourceKey: "team-roles",
        relationLabelKeys: ["name", "role_key"],
        placeholderOptionLabel: "All teams",
      },
      { name: "service_date", label: "Service Date", type: "date", required: true, defaultValue: () => getNowDateInput(), compact: true },
      { name: "title", label: "Sermon / Plan Title", type: "text", required: true, placeholder: "Sunday Morning Service", compact: true },
      {
        name: "songs_text",
        label: "Song List",
        type: "textarea",
        placeholder: "One song per line\nOpen the Eyes of My Heart\nGoodness of God\nWay Maker",
        rows: 6,
        fullWidth: true,
      },
      { name: "notes", label: "Notes for Teams", type: "textarea", placeholder: "Slides, transitions, scripture cues, media notes...", rows: 4, fullWidth: true },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Date", name: "service_date", format: formatDate },
      { label: "Team", name: "role_label" },
      { label: "Title", name: "title" },
      { label: "Songs", name: "songs_count" },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "seasonal-features",
    label: "Homepage Highlight Cards",
    singularLabel: "Highlight Card",
    description: "Create a stacked rotation of homepage highlight cards with timing, media, and default video volume.",
    icon: IconCalendarEvent,
    listEndpoint: "/api/admin/seasonal-features?include_inactive=true&limit=120",
    createEndpoint: "/api/admin/seasonal-features",
    itemEndpoint: (id) => `/api/admin/seasonal-features/${id}`,
    listKey: "seasonalFeatures",
    fields: [
      { name: "title", label: "Card Heading", type: "text", placeholder: "Community Worship Night" },
      { name: "body", label: "Card Message", type: "textarea", placeholder: "Share event details, reminder text, or seasonal thought...", rows: 4, fullWidth: true },
      {
        name: "media_url",
        label: "Media URL",
        type: "text",
        compact: true,
        placeholder: "",
        upload: {
          folder: "seasonal",
          accept: "video/*,image/*",
          helperText: "Drag/drop or choose a local video/image file to upload.",
          uploadOnly: true,
        },
      },
      {
        name: "media_type",
        label: "Media Type",
        type: "select",
        compact: true,
        options: [
          { value: "", label: "None" },
          { value: "video", label: "Video" },
          { value: "image", label: "Image" },
        ],
        defaultValue: "",
      },
      { name: "display_seconds", label: "Display Seconds", type: "number", defaultValue: 12, compact: true, min: 5, max: 120 },
      { name: "volume_percent", label: "Default Volume (0-100)", type: "number", defaultValue: 25, compact: true, min: 0, max: 100 },
      { name: "cta_label", label: "CTA Label", type: "text", placeholder: "Learn More" },
      { name: "cta_url", label: "CTA URL", type: "text", placeholder: "/sermons" },
      { name: "season_tag", label: "Tag (Optional)", type: "text", placeholder: "Spring 2026" },
      { name: "starts_at", label: "Starts At", type: "datetime", defaultValue: () => getNowDateTimeInput() },
      { name: "ends_at", label: "Ends At", type: "datetime" },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Heading", name: "title" },
      { label: "Media", name: "media_type" },
      { label: "Display (sec)", name: "display_seconds" },
      { label: "Volume", name: "volume_percent" },
      { label: "Starts", name: "starts_at", format: formatDateTime },
      { label: "Ends", name: "ends_at", format: formatDateTime },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "photo-albums",
    label: "Photo Albums",
    singularLabel: "Photo Album",
    description: "Create album names and dates for youth and church photo galleries.",
    icon: IconPhoto,
    listEndpoint: "/api/admin/photo-albums?include_unpublished=true&limit=200",
    createEndpoint: "/api/admin/photo-albums",
    itemEndpoint: (id) => `/api/admin/photo-albums/${id}`,
    listKey: "photoAlbums",
    fields: [
      { name: "title", label: "Album Title", type: "text", required: true, placeholder: "Youth Get Together", compact: true },
      { name: "album_date", label: "Album Date", type: "date", defaultValue: () => getNowDateInput() },
      { name: "description", label: "Description", type: "textarea", placeholder: "Optional album summary...", rows: 5, fullWidth: true },
      {
        name: "cover_photo_url",
        label: "Cover Photo",
        type: "text",
        upload: {
          folder: "albums/covers",
          accept: "image/*",
          helperText: "Upload a local image file for the album cover.",
          uploadOnly: true,
        },
      },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Date", name: "album_date", format: formatDate },
      { label: "Sort", name: "sort_order" },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "album-photos",
    label: "Album Photos",
    singularLabel: "Album Photo",
    description: "Add unlimited photos to an album and select the album from the list.",
    icon: IconPhoto,
    listEndpoint: "/api/admin/album-photos?include_unpublished=true&limit=300",
    createEndpoint: "/api/admin/album-photos",
    itemEndpoint: (id) => `/api/admin/album-photos/${id}`,
    listKey: "albumPhotos",
    fields: [
      {
        name: "album_id",
        label: "Album",
        type: "relation",
        relationResourceKey: "photo-albums",
        relationLabelKeys: ["title", "album_date"],
        required: true,
        compact: true,
        placeholderOptionLabel: "Select album",
      },
      {
        name: "photo_url",
        label: "Photo File",
        type: "text",
        required: true,
        upload: {
          folder: "albums/photos",
          accept: "image/*",
          helperText: "Upload a local image file. URL is filled automatically.",
          uploadOnly: true,
        },
      },
      { name: "caption", label: "Caption", type: "textarea", placeholder: "Optional caption", rows: 3, fullWidth: true },
      { name: "taken_on", label: "Photo Date", type: "date" },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Album", name: "album_title" },
      { label: "Photo URL", name: "photo_url" },
      { label: "Date", name: "taken_on", format: formatDate },
      { label: "Sort", name: "sort_order" },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "gallery-videos",
    label: "Gallery Videos",
    singularLabel: "Gallery Video",
    description: "Store separate video links for youth/church gallery playback.",
    icon: IconPlayerPlay,
    listEndpoint: "/api/admin/gallery-videos?include_unpublished=true&limit=200",
    createEndpoint: "/api/admin/gallery-videos",
    itemEndpoint: (id) => `/api/admin/gallery-videos/${id}`,
    listKey: "galleryVideos",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Wednesday Night Recap", compact: true },
      {
        name: "video_url",
        label: "Video File",
        type: "text",
        required: true,
        upload: {
          folder: "gallery/videos",
          accept: "video/*",
          helperText: "Upload a local video file. URL is filled automatically.",
          uploadOnly: true,
        },
      },
      {
        name: "thumbnail_url",
        label: "Thumbnail",
        type: "text",
        upload: {
          folder: "gallery/thumbnails",
          accept: "image/*",
          helperText: "Optional: upload a local thumbnail image.",
          uploadOnly: true,
        },
      },
      { name: "description", label: "Description", type: "textarea", placeholder: "Optional details...", rows: 5, fullWidth: true },
      { name: "recorded_on", label: "Recorded On", type: "date" },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Video URL", name: "video_url" },
      { label: "Recorded", name: "recorded_on", format: formatDate },
      { label: "Sort", name: "sort_order" },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "scriptures",
    label: "Scriptures",
    singularLabel: "Scripture",
    description: "Youth scripture of the week.",
    icon: IconBible,
    listEndpoint: "/api/admin/scriptures?include_unpublished=true&limit=120",
    createEndpoint: "/api/admin/scriptures",
    itemEndpoint: (id) => `/api/admin/scriptures/${id}`,
    listKey: "scriptures",
    fields: [
      {
        name: "audience",
        label: "Audience",
        type: "select",
        options: [
          { value: "main", label: "Main (unused on homepage)" },
          { value: "youth", label: "Youth" },
        ],
        required: true,
        defaultValue: "youth",
      },
      { name: "reference", label: "Scripture Reference", type: "text", required: true, placeholder: "John 3:16" },
      { name: "verse_text", label: "Verse Text", type: "textarea", required: true, placeholder: "Verse text...", rows: 9, fullWidth: true },
      { name: "week_start", label: "Week Start", type: "date", required: true, defaultValue: () => getNowDateInput() },
      { name: "week_end", label: "Week End", type: "date", required: true, defaultValue: () => getNowDateInput() },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Audience", name: "audience" },
      { label: "Reference", name: "reference" },
      { label: "Week Start", name: "week_start", format: formatDate },
      { label: "Week End", name: "week_end", format: formatDate },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "youth-banners",
    label: "Youth Banners",
    singularLabel: "Youth Banner",
    description: "Top hero/CTA banner content for LC Youth.",
    icon: IconPhoto,
    listEndpoint: "/api/admin/youth-banners?include_inactive=true&limit=120",
    createEndpoint: "/api/admin/youth-banners",
    itemEndpoint: (id) => `/api/admin/youth-banners/${id}`,
    listKey: "youthBanners",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Banner title" },
      { name: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Subtitle / ticker text", rows: 5, fullWidth: true },
      {
        name: "image_url",
        label: "Banner Image",
        type: "text",
        upload: {
          folder: "youth/banners",
          accept: "image/*",
          helperText: "Upload a local image file for the youth hero/banner.",
          uploadOnly: true,
        },
      },
      { name: "cta_label", label: "CTA Label", type: "text", placeholder: "Plan a Visit" },
      { name: "cta_url", label: "CTA URL", type: "text", placeholder: "/visit" },
      { name: "starts_at", label: "Starts At", type: "datetime", defaultValue: () => getNowDateTimeInput() },
      { name: "ends_at", label: "Ends At", type: "datetime" },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "CTA", name: "cta_label" },
      { label: "Starts", name: "starts_at", format: formatDateTime },
      { label: "Ends", name: "ends_at", format: formatDateTime },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "livestreams",
    label: "Livestream",
    singularLabel: "Livestream",
    description: "Manual stream embed, fallback video, and CTA copy.",
    icon: IconBroadcast,
    listEndpoint: "/api/admin/livestreams?include_inactive=true&limit=120",
    createEndpoint: "/api/admin/livestreams",
    itemEndpoint: (id) => `/api/admin/livestreams/${id}`,
    listKey: "livestreams",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Sunday Service Live" },
      { name: "embed_url", label: "Embed URL", type: "text", required: true, placeholder: "https://www.youtube.com/embed/..." },
      {
        name: "fallback_video_url",
        label: "Fallback Video",
        type: "text",
        upload: {
          folder: "livestream/fallback",
          accept: "video/*",
          helperText: "Upload a local fallback video file.",
          uploadOnly: true,
        },
      },
      { name: "watch_cta_label", label: "Watch CTA Label", type: "text", defaultValue: "Watch Live Now" },
      { name: "starts_at", label: "Starts At", type: "datetime" },
      { name: "ends_at", label: "Ends At", type: "datetime" },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Embed URL", name: "embed_url" },
      { label: "Fallback", name: "fallback_video_url" },
      { label: "Active", name: "is_active" },
      { label: "Created", name: "created_at", format: formatDateTime },
    ],
  },
  {
    key: "sermons",
    label: "Sermons",
    singularLabel: "Sermon",
    description: "API-fed from YouTube channel settings. Manual URL entry is disabled.",
    icon: IconPlayerPlay,
    readOnly: true,
    listEndpoint: "/api/admin/sermons?include_unpublished=true&limit=120",
    createEndpoint: "/api/admin/sermons",
    itemEndpoint: (id) => `/api/admin/sermons/${id}`,
    listKey: "sermons",
    readOnlyMessage:
      "Sermons on the public page are loaded from YouTube API. Manage channel/API settings instead of entering URLs here.",
    fields: [],
    preview: [
      { label: "Title", name: "title" },
      { label: "Video URL", name: "video_url" },
      { label: "Preached On", name: "preached_on", format: formatDate },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "archived-sermons",
    label: "Archived Sermons",
    singularLabel: "Archived Sermon",
    description: "Staging table for local/archive sermon media.",
    icon: IconArchive,
    listEndpoint: "/api/admin/archived-sermons?include_unpublished=true&limit=120",
    createEndpoint: "/api/admin/archived-sermons",
    itemEndpoint: (id) => `/api/admin/archived-sermons/${id}`,
    listKey: "archivedSermons",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Archive title" },
      { name: "media_url", label: "Media URL", type: "text", required: true, placeholder: "https://cdn.../file.mp4" },
      { name: "thumbnail_url", label: "Thumbnail URL", type: "text", placeholder: "https://cdn.../thumb.jpg" },
      { name: "preached_on", label: "Preached On", type: "date" },
      { name: "speaker", label: "Speaker", type: "text", placeholder: "Guest speaker" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Short summary", rows: 6, fullWidth: true },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Media URL", name: "media_url" },
      { label: "Speaker", name: "speaker" },
      { label: "Preached On", name: "preached_on", format: formatDate },
      { label: "Published", name: "is_published" },
    ],
  },
];

const MONITOR_RESOURCES = [
  {
    key: "prayer-requests",
    label: "Prayer Requests",
    icon: IconMessageCircleHeart,
    endpoint: "/api/admin/prayer-requests?limit=150",
    listKey: "prayerRequests",
    itemEndpoint: (id) => `/api/admin/prayer-requests/${id}`,
  },
  {
    key: "visit-requests",
    label: "Visit Requests",
    icon: IconMapPin,
    endpoint: "/api/admin/visit-requests?limit=150",
    listKey: "visitRequests",
    itemEndpoint: (id) => `/api/admin/visit-requests/${id}`,
  },
];

function getInitialDraft(fields) {
  const draft = {};
  for (const field of fields) {
    if (typeof field.defaultValue === "function") {
      draft[field.name] = field.defaultValue();
    } else if (field.defaultValue !== undefined) {
      draft[field.name] = field.defaultValue;
    } else if (field.type === "checkbox") {
      draft[field.name] = false;
    } else if (field.type === "number") {
      draft[field.name] = 0;
    } else {
      draft[field.name] = "";
    }
  }
  return draft;
}

function itemToDraft(fields, item) {
  const draft = {};
  for (const field of fields) {
    const value = item?.[field.name];
    if (field.type === "checkbox") {
      draft[field.name] = Boolean(value);
      continue;
    }
    if (field.type === "number") {
      draft[field.name] = value ?? 0;
      continue;
    }
    if (field.type === "date") {
      draft[field.name] = toDateInput(value);
      continue;
    }
    if (field.type === "datetime") {
      draft[field.name] = toDateTimeInput(value);
      continue;
    }
    draft[field.name] = value == null ? "" : String(value);
  }
  return draft;
}

function draftToPayload(fields, draft) {
  const payload = {};
  for (const field of fields) {
    const value = draft[field.name];
    if (field.type === "checkbox") {
      payload[field.name] = Boolean(value);
      continue;
    }
    if (field.type === "number") {
      const parsed = Number.parseInt(String(value ?? "0"), 10);
      payload[field.name] = Number.isFinite(parsed) ? parsed : 0;
      continue;
    }
    payload[field.name] = value == null ? "" : String(value);
  }
  return payload;
}

function getErrorMessage(payload, fallback) {
  return payload?.error || payload?.message || fallback;
}

function getSingularLabel(resource) {
  return resource.singularLabel || resource.label;
}

function resolvePrimaryLabel(item) {
  const priority = [
    "title",
    "member_label",
    "role_label",
    "album_title",
    "reference",
    "name",
    "email",
    "username",
  ];
  for (const key of priority) {
    const value = String(item?.[key] || "").trim();
    if (value) {
      return value;
    }
  }
  return item?.id || "Untitled";
}

function buildRelationLabel(item, field) {
  const keys = Array.isArray(field?.relationLabelKeys) ? field.relationLabelKeys : [];
  const values = keys
    .map((key) => String(item?.[key] ?? "").trim())
    .filter(Boolean);
  if (values.length > 1) {
    return `${values[0]} (${values.slice(1).join(" • ")})`;
  }
  if (values.length === 1) {
    return values[0];
  }
  return String(item?.id || "Unknown");
}

function FieldInput({ field, value, onChange, idPrefix, relationOptions = [] }) {
  const inputId = `${idPrefix}-${field.name}`;
  const fieldClassName = [
    styles.field,
    field.fullWidth ? styles.fieldWide : "",
    field.compact ? styles.fieldCompact : "",
  ]
    .filter(Boolean)
    .join(" ");
  const uploadInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  if (field.type === "textarea") {
    return (
      <label className={fieldClassName} htmlFor={inputId}>
        <span>{field.label}</span>
        <textarea
          id={inputId}
          value={value}
          required={Boolean(field.required)}
          placeholder={field.placeholder || ""}
          rows={field.rows || 5}
          style={{ minHeight: `${Math.max(84, (field.rows || 5) * 18)}px` }}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className={fieldClassName} htmlFor={inputId}>
        <span>{field.label}</span>
        <select id={inputId} value={value} required={Boolean(field.required)} onChange={(event) => onChange(field.name, event.target.value)}>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "relation") {
    const normalizedValue = value == null ? "" : String(value);
    const hasSelectedOption = relationOptions.some(
      (option) => String(option.value) === normalizedValue,
    );
    const fallbackOption =
      normalizedValue && !hasSelectedOption
        ? [{ value: normalizedValue, label: `Current selection (${normalizedValue.slice(0, 8)}...)` }]
        : [];

    return (
      <label className={fieldClassName} htmlFor={inputId}>
        <span>{field.label}</span>
        <select
          id={inputId}
          value={normalizedValue}
          required={Boolean(field.required)}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          <option value="">{field.placeholderOptionLabel || "Select an option"}</option>
          {fallbackOption.map((option) => (
            <option key={`fallback-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
          {relationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className={styles.checkboxField} htmlFor={inputId}>
        <input
          id={inputId}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  const typeMap = {
    date: "date",
    datetime: "datetime-local",
    number: "number",
    password: "password",
    text: "text",
  };
  const inputType = typeMap[field.type] || "text";
  const uploadConfig = field.upload || null;
  const uploadOnly = Boolean(uploadConfig?.uploadOnly);

  async function uploadFile(file) {
    if (!file || !uploadConfig) {
      return;
    }
    setUploadError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (uploadConfig.folder) {
        formData.append("folder", uploadConfig.folder);
      }
      if (uploadConfig.bucket) {
        formData.append("bucket", uploadConfig.bucket);
      }

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) {
        throw new Error(getErrorMessage(payload, "Unable to upload file."));
      }

      onChange(field.name, payload.url);
    } catch (error) {
      setUploadError(error.message || "Unable to upload file.");
    } finally {
      setIsUploading(false);
      setIsDraggingFile(false);
    }
  }

  function onFileInputChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    event.target.value = "";
  }

  function onDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      uploadFile(file);
    } else {
      setIsDraggingFile(false);
    }
  }

  if (inputType === "text" && uploadConfig) {
    return (
      <div className={fieldClassName}>
        <span>{field.label}</span>
        <input
          id={inputId}
          type="text"
          value={value}
          required={Boolean(field.required)}
          placeholder={
            uploadOnly
              ? "Upload a file below to auto-fill this field"
              : field.placeholder || ""
          }
          readOnly={uploadOnly}
          onChange={(event) => {
            if (!uploadOnly) {
              onChange(field.name, event.target.value);
            }
          }}
        />
        <div className={styles.uploadGroup}>
          <div
            className={`${styles.uploadDropzone} ${isDraggingFile ? styles.uploadDropzoneDragging : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDraggingFile(false);
            }}
            onDrop={onDrop}
          >
            Drag and drop file here
          </div>
          <div className={styles.uploadActions}>
            <input
              ref={uploadInputRef}
              id={`${inputId}-upload`}
              type="file"
              accept={uploadConfig.accept || "*/*"}
              className={styles.uploadHiddenInput}
              onChange={onFileInputChange}
            />
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => uploadInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Choose File"}
            </button>
            {uploadConfig.helperText ? <p className={styles.uploadHint}>{uploadConfig.helperText}</p> : null}
          </div>
          {uploadError ? <p className={styles.uploadError}>{uploadError}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <label className={fieldClassName} htmlFor={inputId}>
      <span>{field.label}</span>
      <input
        id={inputId}
        type={inputType}
        value={value}
        required={Boolean(field.required)}
        placeholder={field.placeholder || ""}
        step={field.type === "number" ? "1" : undefined}
        min={field.type === "number" && field.min !== undefined ? field.min : undefined}
        max={field.type === "number" && field.max !== undefined ? field.max : undefined}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </label>
  );
}

export function AdminDashboard({ username }) {
  const router = useRouter();
  const [activeResourceKey, setActiveResourceKey] = useState(CONTENT_RESOURCES[0].key);
  const [contentState, setContentState] = useState(
    Object.fromEntries(
      CONTENT_RESOURCES.map((resource) => [
        resource.key,
        {
          items: [],
          loading: false,
          loaded: false,
          error: "",
        },
      ]),
    ),
  );
  const [monitorState, setMonitorState] = useState(
    Object.fromEntries(
      MONITOR_RESOURCES.map((resource) => [
        resource.key,
        {
          items: [],
          loading: false,
          loaded: false,
          error: "",
        },
      ]),
    ),
  );
  const [createDrafts, setCreateDrafts] = useState(
    Object.fromEntries(CONTENT_RESOURCES.map((resource) => [resource.key, getInitialDraft(resource.fields)])),
  );
  const [editDrafts, setEditDrafts] = useState({});
  const [editingIdByResource, setEditingIdByResource] = useState({});
  const [expandedItemIdByResource, setExpandedItemIdByResource] = useState({});
  const [prayerStatusDrafts, setPrayerStatusDrafts] = useState({});
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);

  const activeResource = useMemo(
    () => CONTENT_RESOURCES.find((resource) => resource.key === activeResourceKey) || CONTENT_RESOURCES[0],
    [activeResourceKey],
  );
  const activeRelationResourceKeys = useMemo(() => {
    const keys = activeResource.fields
      .filter((field) => field.type === "relation" && field.relationResourceKey)
      .map((field) => field.relationResourceKey);
    return Array.from(new Set(keys));
  }, [activeResource]);

  const loadContentResource = useCallback(async (resource) => {
    setContentState((prev) => ({
      ...prev,
      [resource.key]: {
        ...prev[resource.key],
        loading: true,
        error: "",
      },
    }));

    try {
      const response = await fetch(resource.listEndpoint, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, `Unable to load ${resource.label}.`));
      }

      const items = Array.isArray(payload?.[resource.listKey]) ? payload[resource.listKey] : [];
      setContentState((prev) => ({
        ...prev,
        [resource.key]: {
          items,
          loading: false,
          loaded: true,
          error: "",
        },
      }));
    } catch (error) {
      setContentState((prev) => ({
        ...prev,
        [resource.key]: {
          ...prev[resource.key],
          loading: false,
          loaded: true,
          error: error.message || `Unable to load ${resource.label}.`,
        },
      }));
    }
  }, []);

  const loadMonitorResource = useCallback(async (resource) => {
    setMonitorState((prev) => ({
      ...prev,
      [resource.key]: {
        ...prev[resource.key],
        loading: true,
        error: "",
      },
    }));

    try {
      const response = await fetch(resource.endpoint, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, `Unable to load ${resource.label}.`));
      }

      const items = Array.isArray(payload?.[resource.listKey]) ? payload[resource.listKey] : [];
      setMonitorState((prev) => ({
        ...prev,
        [resource.key]: {
          items,
          loading: false,
          loaded: true,
          error: "",
        },
      }));
      if (resource.key === "prayer-requests") {
        setPrayerStatusDrafts(
          Object.fromEntries(items.map((item) => [item.id, String(item.status || "new")])),
        );
      }
    } catch (error) {
      setMonitorState((prev) => ({
        ...prev,
        [resource.key]: {
          ...prev[resource.key],
          loading: false,
          loaded: true,
          error: error.message || `Unable to load ${resource.label}.`,
        },
      }));
    }
  }, []);

  useEffect(() => {
    const resource = CONTENT_RESOURCES.find((entry) => entry.key === activeResourceKey);
    if (!resource) {
      return;
    }

    const state = contentState[resource.key];
    if (!state.loaded && !state.loading) {
      loadContentResource(resource);
    }
  }, [activeResourceKey, contentState, loadContentResource]);

  useEffect(() => {
    for (const resourceKey of activeRelationResourceKeys) {
      const dependency = CONTENT_RESOURCES.find((entry) => entry.key === resourceKey);
      if (!dependency) {
        continue;
      }
      const dependencyState = contentState[resourceKey];
      if (dependencyState && !dependencyState.loaded && !dependencyState.loading) {
        loadContentResource(dependency);
      }
    }
  }, [activeRelationResourceKeys, contentState, loadContentResource]);

  useEffect(() => {
    for (const resource of MONITOR_RESOURCES) {
      loadMonitorResource(resource);
    }
  }, [loadMonitorResource]);

  function setFormNotice(message, isError = false) {
    setNotice(message);
    setNoticeError(isError);
  }

  async function onLogout() {
    if (busyAction) {
      return;
    }
    setBusyAction("logout");
    setFormNotice("");
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setBusyAction("");
    }
  }

  function onCreateDraftChange(resourceKey, fieldName, nextValue) {
    setCreateDrafts((prev) => ({
      ...prev,
      [resourceKey]: {
        ...prev[resourceKey],
        [fieldName]: nextValue,
      },
    }));
  }

  function getRelationOptionsForField(field) {
    if (field.type !== "relation" || !field.relationResourceKey) {
      return [];
    }
    const sourceItems = contentState[field.relationResourceKey]?.items || [];
    return sourceItems
      .map((item) => {
        const id = String(item?.id || "").trim();
        if (!id) {
          return null;
        }
        return {
          value: id,
          label: buildRelationLabel(item, field),
        };
      })
      .filter(Boolean);
  }

  function onEditDraftChange(resourceKey, fieldName, nextValue) {
    setEditDrafts((prev) => ({
      ...prev,
      [resourceKey]: {
        ...prev[resourceKey],
        [fieldName]: nextValue,
      },
    }));
  }

  function startEdit(resource, item) {
    setEditingIdByResource((prev) => ({
      ...prev,
      [resource.key]: item.id,
    }));
    setEditDrafts((prev) => ({
      ...prev,
      [resource.key]: itemToDraft(resource.fields, item),
    }));
    setExpandedItemIdByResource((prev) => ({
      ...prev,
      [resource.key]: item.id,
    }));
  }

  function cancelEdit(resourceKey) {
    setEditingIdByResource((prev) => ({
      ...prev,
      [resourceKey]: "",
    }));
    setEditDrafts((prev) => ({
      ...prev,
      [resourceKey]: {},
    }));
  }

  function toggleItemExpanded(resourceKey, itemId) {
    setExpandedItemIdByResource((prev) => ({
      ...prev,
      [resourceKey]: prev[resourceKey] === itemId ? "" : itemId,
    }));
  }

  async function createItem(resource) {
    const actionKey = `create:${resource.key}`;
    if (busyAction) {
      return;
    }
    setBusyAction(actionKey);
    setFormNotice("");

    try {
      const payload = draftToPayload(resource.fields, createDrafts[resource.key] || {});
      const response = await fetch(resource.createEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(body, `Unable to create ${resource.label}.`));
      }

      setCreateDrafts((prev) => {
        const nextDraft = getInitialDraft(resource.fields);
        if (resource.key === "album-photos") {
          nextDraft.album_id = prev[resource.key]?.album_id || "";
          nextDraft.taken_on = prev[resource.key]?.taken_on || "";
        }
        if (resource.key === "team-member-roles") {
          nextDraft.member_id = prev[resource.key]?.member_id || "";
        }
        return {
          ...prev,
          [resource.key]: nextDraft,
        };
      });
      await loadContentResource(resource);
      setFormNotice(`${getSingularLabel(resource)} created successfully.`);
    } catch (error) {
      setFormNotice(error.message || `Unable to create ${resource.label}.`, true);
    } finally {
      setBusyAction("");
    }
  }

  async function saveItem(resource, itemId) {
    const actionKey = `save:${resource.key}:${itemId}`;
    if (busyAction) {
      return;
    }
    setBusyAction(actionKey);
    setFormNotice("");

    try {
      const payload = draftToPayload(resource.fields, editDrafts[resource.key] || {});
      const response = await fetch(resource.itemEndpoint(itemId), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(body, `Unable to update ${resource.label}.`));
      }

      cancelEdit(resource.key);
      await loadContentResource(resource);
      setFormNotice(`${getSingularLabel(resource)} updated successfully.`);
    } catch (error) {
      setFormNotice(error.message || `Unable to update ${resource.label}.`, true);
    } finally {
      setBusyAction("");
    }
  }

  async function deleteItem(resource, itemId) {
    const actionKey = `delete:${resource.key}:${itemId}`;
    if (busyAction) {
      return;
    }
    if (!window.confirm(`Delete this ${getSingularLabel(resource).toLowerCase()}?`)) {
      return;
    }

    setBusyAction(actionKey);
    setFormNotice("");
    try {
      const response = await fetch(resource.itemEndpoint(itemId), {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(body, `Unable to delete ${resource.label}.`));
      }

      if (editingIdByResource[resource.key] === itemId) {
        cancelEdit(resource.key);
      }
      await loadContentResource(resource);
      setFormNotice(`${getSingularLabel(resource)} deleted.`);
    } catch (error) {
      setFormNotice(error.message || `Unable to delete ${resource.label}.`, true);
    } finally {
      setBusyAction("");
    }
  }

  async function savePrayerStatus(prayerId) {
    const actionKey = `prayer-status:${prayerId}`;
    if (busyAction) {
      return;
    }

    setBusyAction(actionKey);
    setFormNotice("");
    try {
      const response = await fetch(`/api/admin/prayer-requests/${prayerId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: prayerStatusDrafts[prayerId] || "new",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Unable to save prayer request status."));
      }
      await loadMonitorResource(MONITOR_RESOURCES[0]);
      setFormNotice("Prayer request status saved.");
    } catch (error) {
      setFormNotice(error.message || "Unable to save prayer request status.", true);
    } finally {
      setBusyAction("");
    }
  }

  async function deleteMonitorItem(resource, itemId) {
    const actionKey = `monitor-delete:${resource.key}:${itemId}`;
    if (busyAction) {
      return;
    }
    if (!window.confirm("Delete this request?")) {
      return;
    }

    setBusyAction(actionKey);
    setFormNotice("");
    try {
      const response = await fetch(resource.itemEndpoint(itemId), {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Unable to delete request."));
      }
      await loadMonitorResource(resource);
      setFormNotice("Request deleted.");
    } catch (error) {
      setFormNotice(error.message || "Unable to delete request.", true);
    } finally {
      setBusyAction("");
    }
  }

  const activeState = contentState[activeResource.key] || {
    items: [],
    loading: false,
    loaded: false,
    error: "",
  };
  const editingId = editingIdByResource[activeResource.key] || "";
  const expandedId = expandedItemIdByResource[activeResource.key] || "";
  const createDraft = createDrafts[activeResource.key] || getInitialDraft(activeResource.fields);
  const editDraft = editDrafts[activeResource.key] || {};
  const useAccordionCards = activeResource.key === "seasonal-features";

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.brandBlock}>
          <p className={styles.kicker}>Administration</p>
          <h1>
            Liberty Church Administration
          </h1>
          <p className={styles.metaLine}>Signed in: {username}</p>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => loadContentResource(activeResource)}
            disabled={Boolean(busyAction)}
          >
            <IconRefresh size={16} stroke={1.9} aria-hidden="true" />
            Refresh
          </button>
          <Link className={styles.secondaryBtn} href="/" target="_blank" rel="noreferrer">
            Visit Site
          </Link>
          <button type="button" className={styles.ghostBtn} onClick={onLogout} disabled={Boolean(busyAction)}>
            <IconLogout2 size={16} stroke={1.9} aria-hidden="true" />
            Log Out
          </button>
        </div>
      </header>

      {notice ? (
        <p className={noticeError ? styles.noticeError : styles.noticeSuccess} role="status">
          {notice}
        </p>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Content Management</h2>
          <p>Create, review, update, and delete website content for homepage, youth, livestream, and sermons pages.</p>
        </div>

        {isNavOpen ? (
          <button
            type="button"
            className={styles.navBackdrop}
            onClick={() => setIsNavOpen(false)}
            aria-label="Close content menu"
          />
        ) : null}

        <div className={styles.managerLayout}>
          <aside id="admin-resource-menu" className={`${styles.resourceNav} ${isNavOpen ? styles.resourceNavOpen : ""}`} aria-label="Content tables">
            {CONTENT_RESOURCES.map((resource) => {
              const Icon = resource.icon;
              const isActive = resource.key === activeResource.key;
              return (
                <button
                  key={resource.key}
                  type="button"
                  className={isActive ? styles.navBtnActive : styles.navBtn}
                  onClick={() => {
                    setActiveResourceKey(resource.key);
                    setIsNavOpen(false);
                  }}
                >
                  <Icon size={16} stroke={1.9} aria-hidden="true" />
                  <span>{resource.label}</span>
                </button>
              );
            })}
          </aside>

          <div className={styles.resourceMain}>
            <div className={styles.mobileMenuRow}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setIsNavOpen((prev) => !prev)}
                aria-expanded={isNavOpen}
                aria-controls="admin-resource-menu"
              >
                {isNavOpen ? <IconX size={16} stroke={1.9} aria-hidden="true" /> : <IconMenu2 size={16} stroke={1.9} aria-hidden="true" />}
                Content Menu
              </button>
            </div>

            <div className={styles.resourceMeta}>
              <h3>{activeResource.label}</h3>
              <p>{activeResource.description}</p>
              {activeResource.readOnlyMessage ? (
                <p className={styles.readOnlyHint}>{activeResource.readOnlyMessage}</p>
              ) : null}
            </div>

            {!activeResource.readOnly ? (
              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();
                  createItem(activeResource);
                }}
              >
                <div className={styles.fieldsGrid}>
                  {activeResource.fields.map((field) => (
                    <FieldInput
                      key={`create-${activeResource.key}-${field.name}`}
                      field={field}
                      value={createDraft[field.name]}
                      relationOptions={getRelationOptionsForField(field)}
                      onChange={(fieldName, nextValue) => onCreateDraftChange(activeResource.key, fieldName, nextValue)}
                      idPrefix={`create-${activeResource.key}`}
                    />
                  ))}
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryBtn} disabled={Boolean(busyAction)}>
                    <IconPlus size={17} stroke={1.9} aria-hidden="true" />
                    Add {getSingularLabel(activeResource)}
                  </button>
                </div>
              </form>
            ) : null}

            {activeState.error ? (
              <p className={styles.tableError} role="alert">
                {activeState.error}
              </p>
            ) : null}

            {activeState.loading && !activeState.loaded ? <p className={styles.loading}>Loading {activeResource.label.toLowerCase()}...</p> : null}

            <div className={styles.listWrap}>
              {activeState.items.length === 0 && activeState.loaded ? <p className={styles.empty}>No records found.</p> : null}

              {activeState.items.map((item) => {
                const itemIsEditing = editingId === item.id;
                const itemIsExpanded = useAccordionCards ? expandedId === item.id || itemIsEditing : true;
                const compactMediaType = String(item.media_type || "none").toLowerCase() || "none";
                const compactSeconds = Number.parseInt(String(item.display_seconds ?? 12), 10) || 12;
                const compactVolume = Number.parseInt(String(item.volume_percent ?? 25), 10) || 25;
                return (
                  <article key={item.id} className={useAccordionCards ? `${styles.itemCard} ${styles.itemCardCompact}` : styles.itemCard}>
                    <div className={styles.itemTop}>
                      <div>
                        <h4>{resolvePrimaryLabel(item)}</h4>
                      </div>
                      <div className={styles.rowActions}>
                        {useAccordionCards ? (
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => toggleItemExpanded(activeResource.key, item.id)}
                            disabled={Boolean(busyAction)}
                          >
                            {itemIsExpanded ? (
                              <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />
                            ) : (
                              <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />
                            )}
                            {itemIsExpanded ? "Collapse" : "Open"}
                          </button>
                        ) : null}
                        {!activeResource.readOnly ? (
                          <>
                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              onClick={() => (itemIsEditing ? cancelEdit(activeResource.key) : startEdit(activeResource, item))}
                              disabled={Boolean(busyAction)}
                            >
                              {itemIsEditing ? <IconX size={16} stroke={1.9} aria-hidden="true" /> : <IconPencil size={16} stroke={1.9} aria-hidden="true" />}
                              {itemIsEditing ? "Cancel" : "Edit"}
                            </button>
                            <button
                              type="button"
                              className={styles.dangerBtn}
                              onClick={() => deleteItem(activeResource, item.id)}
                              disabled={Boolean(busyAction)}
                            >
                              <IconTrash size={16} stroke={1.9} aria-hidden="true" />
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {useAccordionCards ? (
                      <div className={styles.compactMetaRow}>
                        <span className={styles.compactMetaPill}>Media: {compactMediaType}</span>
                        <span className={styles.compactMetaPill}>Seconds: {compactSeconds}</span>
                        <span className={styles.compactMetaPill}>Volume: {compactVolume}</span>
                        <span className={styles.compactMetaPill}>{item.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    ) : null}

                    {itemIsExpanded ? (
                      itemIsEditing ? (
                        <form
                          className={styles.form}
                          onSubmit={(event) => {
                            event.preventDefault();
                            saveItem(activeResource, item.id);
                          }}
                        >
                          <div className={styles.fieldsGrid}>
                            {activeResource.fields.map((field) => (
                              <FieldInput
                                key={`edit-${item.id}-${field.name}`}
                                field={field}
                                value={editDraft[field.name]}
                                relationOptions={getRelationOptionsForField(field)}
                                onChange={(fieldName, nextValue) => onEditDraftChange(activeResource.key, fieldName, nextValue)}
                                idPrefix={`edit-${item.id}`}
                              />
                            ))}
                          </div>
                          <div className={styles.formActions}>
                            <button type="submit" className={styles.primaryBtn} disabled={Boolean(busyAction)}>
                              <IconDeviceFloppy size={16} stroke={1.9} aria-hidden="true" />
                              Save Changes
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className={styles.previewGrid}>
                          {activeResource.preview.map((entry) => {
                            const raw = item[entry.name];
                            const value = entry.format ? entry.format(raw) : formatValue(raw);
                            return (
                              <p key={`${item.id}-${entry.name}`}>
                                <strong>{entry.label}:</strong> {value}
                              </p>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      !useAccordionCards ? (
                        <div className={styles.previewGrid}>
                          {activeResource.preview.slice(0, 3).map((entry) => {
                            const raw = item[entry.name];
                            const value = entry.format ? entry.format(raw) : formatValue(raw);
                            return (
                              <p key={`${item.id}-${entry.name}`}>
                                <strong>{entry.label}:</strong> {value}
                              </p>
                            );
                          })}
                        </div>
                      ) : null
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Requests Monitor</h2>
          <p>Track incoming prayer and visit requests submitted from public forms.</p>
        </div>

        <div className={styles.monitorGrid}>
          {MONITOR_RESOURCES.map((resource) => {
            const Icon = resource.icon;
            const state = monitorState[resource.key] || { items: [], loading: false, error: "" };
            return (
              <article key={resource.key} className={styles.monitorCard}>
                <div className={styles.monitorHeader}>
                  <h3>
                    <Icon size={18} stroke={1.9} aria-hidden="true" />
                    {resource.label}
                  </h3>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => loadMonitorResource(resource)}
                    disabled={Boolean(busyAction)}
                  >
                    <IconRefresh size={15} stroke={1.9} aria-hidden="true" />
                    Refresh
                  </button>
                </div>

                {state.error ? (
                  <p className={styles.tableError} role="alert">
                    {state.error}
                  </p>
                ) : null}
                {state.loading && !state.loaded ? <p className={styles.loading}>Loading...</p> : null}
                {state.items.length === 0 && state.loaded ? <p className={styles.empty}>No requests found.</p> : null}

                <div className={styles.monitorList}>
                  {state.items.map((item) => (
                    <article key={item.id} className={styles.monitorItem}>
                      <div className={styles.monitorItemHeader}>
                        <h4>{item.name || item.email || item.id}</h4>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => deleteMonitorItem(resource, item.id)}
                          disabled={Boolean(busyAction)}
                        >
                          <IconTrash size={14} stroke={1.9} aria-hidden="true" />
                          Delete
                        </button>
                      </div>

                      <p>
                        <strong>Email:</strong> {formatValue(item.email)}
                      </p>
                      <p>
                        <strong>Phone:</strong> {formatValue(item.phone)}
                      </p>
                      {"submitted_at" in item ? (
                        <p>
                          <strong>Submitted:</strong> {formatDateTime(item.submitted_at)}
                        </p>
                      ) : null}

                      {"request_text" in item ? (
                        <p>
                          <strong>Request:</strong> {formatValue(item.request_text)}
                        </p>
                      ) : null}

                      {"preferred_service" in item ? (
                        <p>
                          <strong>Preferred Service:</strong> {formatValue(item.preferred_service)}
                        </p>
                      ) : null}

                      {"party_size" in item ? (
                        <p>
                          <strong>Party Size:</strong> {formatValue(item.party_size)}
                        </p>
                      ) : null}

                      {"message" in item ? (
                        <p>
                          <strong>Notes:</strong> {formatValue(item.message)}
                        </p>
                      ) : null}

                      {"status" in item ? (
                        <div className={styles.inlineControls}>
                          <label htmlFor={`status-${item.id}`}>Status</label>
                          <select
                            id={`status-${item.id}`}
                            value={prayerStatusDrafts[item.id] || String(item.status || "new")}
                            onChange={(event) =>
                              setPrayerStatusDrafts((prev) => ({
                                ...prev,
                                [item.id]: event.target.value,
                              }))
                            }
                          >
                            <option value="new">new</option>
                            <option value="in_progress">in_progress</option>
                            <option value="prayed">prayed</option>
                            <option value="closed">closed</option>
                          </select>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => savePrayerStatus(item.id)}
                            disabled={Boolean(busyAction)}
                          >
                            <IconDeviceFloppy size={14} stroke={1.9} aria-hidden="true" />
                            Save
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

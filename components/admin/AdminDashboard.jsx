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
  IconReceiptDollar,
  IconRefresh,
  IconShoppingCart,
  IconSpeakerphone,
  IconShare,
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
  if (Array.isArray(value)) {
    if (!value.length) {
      return "—";
    }
    return value
      .map((entry) => (typeof entry === "string" ? entry : JSON.stringify(entry)))
      .join(", ");
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
    key: "social-links",
    label: "Social Links",
    singularLabel: "Social Link",
    description: "Manage the public social platforms shown across the site and app.",
    icon: IconShare,
    listEndpoint: "/api/admin/social-links?include_inactive=true&limit=120",
    createEndpoint: "/api/admin/social-links",
    itemEndpoint: (id) => `/api/admin/social-links/${id}`,
    listKey: "socialLinks",
    fields: [
      { name: "platform_key", label: "Platform Key", type: "text", required: true, placeholder: "facebook" },
      { name: "label", label: "Label", type: "text", required: true, placeholder: "Facebook" },
      { name: "url", label: "URL", type: "text", required: true, placeholder: "https://www.facebook.com/CenlaChurch/" },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Platform Key", name: "platform_key" },
      { label: "Label", name: "label" },
      { label: "URL", name: "url" },
      { label: "Sort", name: "sort_order" },
      { label: "Active", name: "is_active" },
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
    label: "Team Roles",
    singularLabel: "Team Role",
    description: "Create and manage ministry role definitions (Pastor, Media Team, Youth Minister, etc.).",
    icon: IconUsersGroup,
    listEndpoint: "/api/admin/team-roles?include_inactive=true&limit=300",
    createEndpoint: "/api/admin/team-roles",
    itemEndpoint: (id) => `/api/admin/team-roles/${id}`,
    listKey: "teamRoles",
    fields: [
      { name: "name", label: "Role Name", type: "text", required: true, placeholder: "Media Team" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Optional description...", rows: 4, fullWidth: true },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Role Key", name: "role_key" },
      { label: "Role Name", name: "name" },
      { label: "Sort", name: "sort_order" },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "team-members",
    label: "Team Members",
    singularLabel: "Team Member",
    description: "Create member records, assign ministry roles, and control access.",
    icon: IconUsersGroup,
    listEndpoint: "/api/admin/team-members?include_inactive=true&limit=300",
    createEndpoint: "/api/admin/team-members",
    itemEndpoint: (id) => `/api/admin/team-members/${id}`,
    listKey: "teamMembers",
    fields: [
      { name: "full_name", label: "Full Name", type: "text", placeholder: "Display name" },
      { name: "email", label: "Email", type: "text", placeholder: "name@example.com" },
      { name: "phone", label: "Phone", type: "text", placeholder: "(###) ###-####" },
      { name: "username", label: "Username", type: "text", required: true, placeholder: "xrkr80hdadmin" },
      { name: "password", label: "Login Password", type: "password", placeholder: "Set password (min 8 chars)" },
      {
        name: "role_ids",
        label: "Role Permissions",
        type: "relation_multi",
        relationResourceKey: "team-roles",
        relationLabelKeys: ["name"],
        showRoleIcon: false,
      },
      { name: "is_superuser", label: "Superuser", type: "checkbox", defaultValue: false },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      { name: "notes", label: "Notes", type: "textarea", placeholder: "Optional notes...", rows: 4, fullWidth: true },
    ],
    preview: [
      { label: "Username", name: "username" },
      { label: "Name", name: "full_name" },
      { label: "Email", name: "email" },
      { label: "Roles", name: "role_labels" },
      { label: "Superuser", name: "is_superuser" },
      { label: "Last Login", name: "last_login_at", format: formatDateTime },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "team-member-roles",
    label: "Role Assignments (Advanced)",
    singularLabel: "Role Assignment",
    description: "Advanced role-mapping editor. Most assignments should be managed in Team Members.",
    hidden: true,
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
    key: "ministry-order-requests",
    label: "Ministry Order Requests",
    singularLabel: "Order Request",
    description:
      "Each ministry can submit what they need. Pastor can review, approve, and track ordering status.",
    icon: IconShoppingCart,
    listEndpoint: "/api/admin/ministry-order-requests?include_closed=true&limit=300",
    createEndpoint: "/api/admin/ministry-order-requests",
    itemEndpoint: (id) => `/api/admin/ministry-order-requests/${id}`,
    listKey: "ministryOrderRequests",
    fields: [
      {
        name: "role_id",
        label: "Ministry Role",
        type: "relation",
        relationResourceKey: "team-roles",
        relationLabelKeys: ["name", "role_key"],
        required: true,
        placeholderOptionLabel: "Select ministry role",
      },
      { name: "title", label: "Request Title", type: "text", required: true, placeholder: "Quarterly communion supplies" },
      {
        name: "request_details",
        label: "Request Details",
        type: "textarea",
        required: true,
        rows: 5,
        placeholder: "List exactly what is needed, quantity, and any product notes.",
        fullWidth: true,
      },
      { name: "needed_by_date", label: "Needed By", type: "date" },
      { name: "estimated_cost", label: "Estimated Cost ($)", type: "decimal", step: "0.01", min: 0 },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: "new",
        options: [
          { value: "new", label: "New" },
          { value: "reviewing", label: "Reviewing" },
          { value: "ordered", label: "Ordered" },
          { value: "fulfilled", label: "Fulfilled" },
          { value: "declined", label: "Declined" },
        ],
      },
      {
        name: "pastor_notes",
        label: "Pastor Notes",
        type: "textarea",
        rows: 3,
        placeholder: "Pastor decision notes (optional)",
        fullWidth: true,
      },
    ],
    preview: [
      { label: "Role", name: "role_label" },
      { label: "Requested By", name: "requester_label" },
      { label: "Needed By", name: "needed_by_date", format: formatDate },
      { label: "Estimated Cost", name: "estimated_cost" },
      { label: "Status", name: "status" },
    ],
  },
  {
    key: "bookkeeping-reports",
    label: "Bookkeeping Reports",
    singularLabel: "Bookkeeping Report",
    description:
      "Restricted section for offering and finance reporting. Visible to Pastor and Bookkeeper only.",
    requiredRoleKeys: ["pastor", "bookkeeper"],
    icon: IconReceiptDollar,
    listEndpoint: "/api/admin/bookkeeping-reports?include_inactive=true&limit=300",
    createEndpoint: "/api/admin/bookkeeping-reports",
    itemEndpoint: (id) => `/api/admin/bookkeeping-reports/${id}`,
    listKey: "bookkeepingReports",
    fields: [
      { name: "report_date", label: "Report Date", type: "date", required: true, defaultValue: () => getNowDateInput() },
      {
        name: "entry_type",
        label: "Entry Type",
        type: "select",
        required: true,
        defaultValue: "offering",
        options: [
          { value: "offering", label: "Offering" },
          { value: "tithe", label: "Tithe" },
          { value: "expense", label: "Expense" },
          { value: "adjustment", label: "Adjustment" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Sunday AM Offering" },
      { name: "amount", label: "Amount ($)", type: "decimal", required: true, step: "0.01", min: 0 },
      { name: "notes", label: "Notes", type: "textarea", rows: 4, placeholder: "Optional notes...", fullWidth: true },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Date", name: "report_date", format: formatDate },
      { label: "Type", name: "entry_type" },
      { label: "Title", name: "title" },
      { label: "Amount", name: "amount" },
      { label: "Submitted By", name: "submitted_by_label" },
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
    label: "Albums",
    singularLabel: "Photo Album",
    description: "Create top-level albums for church and youth galleries.",
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
    label: "Photos in Albums",
    singularLabel: "Album Photo",
    description: "Add photos into a selected album.",
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
    description: "Manual stream setup with required fallback video and CTA copy.",
    icon: IconBroadcast,
    listEndpoint: "/api/admin/livestreams?include_inactive=true&limit=120",
    createEndpoint: "/api/admin/livestreams",
    itemEndpoint: (id) => `/api/admin/livestreams/${id}`,
    listKey: "livestreams",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Sunday Service Live", compact: true },
      { name: "embed_url", label: "Embed URL", type: "text", required: true, placeholder: "https://www.youtube.com/embed/...", compact: true },
      {
        name: "fallback_video_url",
        label: "Fallback Video",
        type: "text",
        compact: true,
        upload: {
          folder: "livestream/fallback",
          accept: "video/*",
          helperText: "Upload fallback video file for outage scenarios.",
          uploadOnly: true,
        },
      },
      { name: "watch_cta_label", label: "Watch CTA Label", type: "text", defaultValue: "Watch Live Now", compact: true },
      { name: "starts_at", label: "Starts At", type: "datetime", compact: true },
      { name: "ends_at", label: "Ends At", type: "datetime", compact: true },
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

const LIBERTY_ROLE_PRESETS = [
  {
    role_key: "foh_sound",
    name: "FOH Sound",
    description: "Front of house sound operations.",
    sort_order: 10,
  },
  {
    role_key: "worship_leader",
    name: "Worship Leader",
    description: "Leads worship sets and team flow.",
    sort_order: 20,
  },
  {
    role_key: "worship_team",
    name: "Worship Team",
    description: "Worship team members and support.",
    sort_order: 30,
  },
  {
    role_key: "pastor",
    name: "Pastor",
    description: "Pastoral leadership and sermon coordination.",
    sort_order: 40,
  },
  {
    role_key: "media_team",
    name: "Media Team",
    description: "Slides, livestream, and media operations.",
    sort_order: 50,
  },
  {
    role_key: "youth_minister",
    name: "Youth Minister",
    description: "Youth ministry leadership.",
    sort_order: 60,
  },
  {
    role_key: "youth_minister_assistant",
    name: "Youth Minister Assistant",
    description: "Supports youth minister activities.",
    sort_order: 70,
  },
  {
    role_key: "kids_church",
    name: "Kids Church",
    description: "Kids ministry and classes.",
    sort_order: 80,
  },
  {
    role_key: "bookkeeper",
    name: "Bookkeeper",
    description: "Bookkeeping and offering reporting.",
    sort_order: 100,
  },
];

function normalizeRoleLookup(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const LEGACY_ROLE_KEYS = new Set(["youth_ministry", "childrens_church"]);

function getRoleIconUrl(roleKey, roleName) {
  const key = normalizeRoleLookup(roleKey);
  const name = normalizeRoleLookup(roleName);
  const role = key || name;

  if (role.includes("foh")) {
    return "/assets/roles_icons/FOH_sound.png";
  }
  if (role.includes("media")) {
    return "/assets/roles_icons/media_team.png";
  }
  if (role.includes("worship_leader") || role.includes("music_minister")) {
    return "/assets/roles_icons/music_minister.png";
  }
  if (role.includes("worship_team")) {
    return "/assets/roles_icons/worship_team.png";
  }
  if (role.includes("pastor")) {
    return "/assets/roles_icons/pastor.png";
  }
  if (role.includes("youth")) {
    return "/assets/roles_icons/youth_minister.png";
  }
  if (role.includes("bookkeeper") || role.includes("book_keeper")) {
    return "/assets/roles_icons/admin.png";
  }
  if (role.includes("kids") || role.includes("child")) {
    return "/assets/roles_icons/admin.png";
  }
  return "/assets/roles_icons/admin.png";
}

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
    } else if (field.type === "relation_multi") {
      draft[field.name] = [];
    } else if (field.type === "decimal") {
      draft[field.name] = 0;
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
    if (field.type === "relation_multi") {
      if (Array.isArray(value)) {
        draft[field.name] = value.map((entry) => String(entry)).filter(Boolean);
      } else {
        draft[field.name] = [];
      }
      continue;
    }
    if (field.type === "checkbox") {
      draft[field.name] = Boolean(value);
      continue;
    }
    if (field.type === "number") {
      draft[field.name] = value ?? 0;
      continue;
    }
    if (field.type === "decimal") {
      if (value === null || value === undefined || value === "") {
        draft[field.name] = 0;
      } else {
        const parsed = Number.parseFloat(String(value));
        draft[field.name] = Number.isFinite(parsed) ? parsed : 0;
      }
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
    if (field.type === "relation_multi") {
      payload[field.name] = Array.isArray(value)
        ? value.map((entry) => String(entry)).filter(Boolean)
        : [];
      continue;
    }
    if (field.type === "checkbox") {
      payload[field.name] = Boolean(value);
      continue;
    }
    if (field.type === "number") {
      const parsed = Number.parseInt(String(value ?? "0"), 10);
      payload[field.name] = Number.isFinite(parsed) ? parsed : 0;
      continue;
    }
    if (field.type === "decimal") {
      const parsed = Number.parseFloat(String(value ?? "0"));
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
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [multiSearch, setMultiSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  if (field.type === "relation_multi") {
    const selectedValues = Array.isArray(value)
      ? value.map((entry) => String(entry))
      : [];
    const selectedSet = new Set(selectedValues);
    const search = multiSearch.trim().toLowerCase();
    const filteredOptions = relationOptions.filter((option) =>
      String(option?.label || "")
        .toLowerCase()
        .includes(search),
    );

    function toggleValue(optionValue) {
      const normalized = String(optionValue);
      const nextSet = new Set(selectedSet);
      if (nextSet.has(normalized)) {
        nextSet.delete(normalized);
      } else {
        nextSet.add(normalized);
      }
      onChange(field.name, Array.from(nextSet));
    }

    return (
      <div className={`${fieldClassName} ${styles.fieldWide}`}>
        <div className={styles.multiSelectHead}>
          <span>{field.label}</span>
          <span className={styles.multiSelectCount}>{selectedSet.size} selected</span>
        </div>
        <div className={styles.multiSelectTools}>
          <input
            type="text"
            value={multiSearch}
            onChange={(event) => setMultiSearch(event.target.value)}
            placeholder={`Search ${field.label.toLowerCase()}...`}
          />
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() =>
              onChange(
                field.name,
                relationOptions.map((option) => String(option.value)),
              )
            }
            disabled={!relationOptions.length}
          >
            Select All
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => onChange(field.name, [])}
            disabled={!selectedSet.size}
          >
            Clear
          </button>
        </div>
        <div className={styles.rolePickerGrid}>
          {filteredOptions.map((option) => {
            const isChecked = selectedSet.has(String(option.value));
            return (
              <button
                key={option.value}
                type="button"
                className={isChecked ? `${styles.rolePickerOption} ${styles.rolePickerOptionActive}` : styles.rolePickerOption}
                onClick={() => toggleValue(option.value)}
              >
                <input type="checkbox" checked={isChecked} readOnly />
                {option.icon_url ? (
                  <img
                    src={option.icon_url}
                    alt=""
                    className={styles.rolePickerIcon}
                    loading="lazy"
                  />
                ) : null}
                <span>{option.label}</span>
              </button>
            );
          })}
          {!filteredOptions.length ? (
            <p className={styles.empty}>No matches for this search.</p>
          ) : null}
        </div>
      </div>
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
    decimal: "number",
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
      setUploadedFileName(String(file.name || "").trim());
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
    }
  }

  function onFileInputChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    event.target.value = "";
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
            {uploadedFileName ? (
              <span className={styles.uploadFileName}>{uploadedFileName}</span>
            ) : null}
            {uploadConfig.helperText ? <p className={styles.uploadHint}>{uploadConfig.helperText}</p> : null}
          </div>
          {uploadError ? <p className={styles.uploadError}>{uploadError}</p> : null}
        </div>
      </div>
    );
  }

  if (inputType === "password") {
    return (
      <label className={fieldClassName} htmlFor={inputId}>
        <span>{field.label}</span>
        <div className={styles.passwordInputWrap}>
          <input
            id={inputId}
            type={showPassword ? "text" : "password"}
            value={value}
            required={Boolean(field.required)}
            placeholder={field.placeholder || ""}
            autoComplete="new-password"
            onChange={(event) => onChange(field.name, event.target.value)}
          />
          <button
            type="button"
            className={styles.passwordToggleBtn}
            onClick={() => setShowPassword((current) => !current)}
            aria-label={`${showPassword ? "Hide" : "Show"} password`}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>
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
        step={
          field.type === "number"
            ? "1"
            : field.type === "decimal"
              ? field.step || "0.01"
              : undefined
        }
        min={
          (field.type === "number" || field.type === "decimal") && field.min !== undefined
            ? field.min
            : undefined
        }
        max={
          (field.type === "number" || field.type === "decimal") && field.max !== undefined
            ? field.max
            : undefined
        }
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </label>
  );
}

export function AdminDashboard({ username, sessionInfo }) {
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
  const [expandedMonitorItemKeys, setExpandedMonitorItemKeys] = useState({});
  const [prayerStatusDrafts, setPrayerStatusDrafts] = useState({});
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const normalizedSessionRoleKeys = useMemo(
    () =>
      (Array.isArray(sessionInfo?.roleKeys) ? sessionInfo.roleKeys : [])
        .map((key) => String(key || "").trim().toLowerCase())
        .filter(Boolean),
    [sessionInfo?.roleKeys],
  );
  const isSessionSuperuser = Boolean(sessionInfo?.isSuperuser);

  const visibleContentResources = useMemo(
    () =>
      CONTENT_RESOURCES.filter((resource) => {
        if (resource.hidden) {
          return false;
        }
        if (!Array.isArray(resource.requiredRoleKeys) || !resource.requiredRoleKeys.length) {
          return true;
        }
        if (isSessionSuperuser) {
          return true;
        }
        const required = resource.requiredRoleKeys
          .map((key) => String(key || "").trim().toLowerCase())
          .filter(Boolean);
        return required.some((requiredKey) =>
          normalizedSessionRoleKeys.includes(requiredKey),
        );
      }),
    [isSessionSuperuser, normalizedSessionRoleKeys],
  );

  const activeResource = useMemo(
    () =>
      visibleContentResources.find((resource) => resource.key === activeResourceKey) ||
      visibleContentResources[0] ||
      CONTENT_RESOURCES[0],
    [activeResourceKey, visibleContentResources],
  );
  const activeRelationResourceKeys = useMemo(() => {
    if (!activeResource) {
      return [];
    }
    const keys = activeResource.fields
      .filter(
        (field) =>
          (field.type === "relation" || field.type === "relation_multi") &&
          field.relationResourceKey,
      )
      .map((field) => field.relationResourceKey);
    return Array.from(new Set(keys));
  }, [activeResource]);

  useEffect(() => {
    if (!visibleContentResources.length) {
      return;
    }
    const hasActive = visibleContentResources.some(
      (resource) => resource.key === activeResourceKey,
    );
    if (!hasActive) {
      setActiveResourceKey(visibleContentResources[0].key);
    }
  }, [activeResourceKey, visibleContentResources]);

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
      if (field.type !== "relation_multi" || !field.relationResourceKey) {
        return [];
      }
    }
    let sourceItems = contentState[field.relationResourceKey]?.items || [];

    if (field.relationResourceKey === "team-roles") {
      sourceItems = sourceItems.filter((item) => {
        if (item?.is_active === false) {
          return false;
        }
        const normalizedRoleKey = normalizeRoleLookup(item?.role_key || item?.name);
        return !LEGACY_ROLE_KEYS.has(normalizedRoleKey);
      });
    }

    return sourceItems
      .map((item) => {
        const id = String(item?.id || "").trim();
        if (!id) {
          return null;
        }
        const showTeamRoleKey =
          field.relationResourceKey === "team-roles" &&
          field.type === "relation_multi" &&
          field.showRoleKeyInLabel !== true;

        return {
          value: id,
          label: showTeamRoleKey
            ? String(item?.name || item?.role_key || id)
            : buildRelationLabel(item, field),
          icon_url:
            field.relationResourceKey === "team-roles" && field.showRoleIcon !== false
              ? getRoleIconUrl(item?.role_key, item?.name)
              : "",
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

  function toggleMonitorItemExpanded(resourceKey, itemId) {
    const key = `${resourceKey}:${itemId}`;
    setExpandedMonitorItemKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
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

  async function applyLibertyRolePresets() {
    const teamRolesResource = CONTENT_RESOURCES.find((resource) => resource.key === "team-roles");
    if (!teamRolesResource || busyAction) {
      return;
    }

    const actionKey = "seed:liberty-role-presets";
    setBusyAction(actionKey);
    setFormNotice("");

    try {
      const existingRoles = contentState["team-roles"]?.items || [];
      const existingByKey = new Map(
        existingRoles
          .map((role) => [normalizeRoleLookup(role?.role_key), role])
          .filter(([key]) => Boolean(key)),
      );
      const existingByName = new Set(
        existingRoles
          .map((role) => normalizeRoleLookup(role?.name))
          .filter(Boolean),
      );

      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      for (const preset of LIBERTY_ROLE_PRESETS) {
        const key = normalizeRoleLookup(preset.role_key);
        const name = normalizeRoleLookup(preset.name);
        const existingRole = existingByKey.get(key) || null;

        if (existingRole?.id) {
          const needsUpdate =
            String(existingRole.name || "") !== String(preset.name || "") ||
            String(existingRole.description || "") !== String(preset.description || "") ||
            Number.parseInt(String(existingRole.sort_order ?? 0), 10) !==
              Number.parseInt(String(preset.sort_order ?? 0), 10) ||
            !Boolean(existingRole.is_active);

          if (needsUpdate) {
            const response = await fetch(teamRolesResource.itemEndpoint(existingRole.id), {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                role_key: preset.role_key,
                name: preset.name,
                description: preset.description,
                sort_order: preset.sort_order,
                is_active: true,
              }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(getErrorMessage(payload, "Unable to sync Liberty role presets."));
            }
            updatedCount += 1;
          } else {
            skippedCount += 1;
          }
          continue;
        }

        if (existingByName.has(name)) {
          skippedCount += 1;
          continue;
        }

        const response = await fetch(teamRolesResource.createEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            role_key: preset.role_key,
            name: preset.name,
            description: preset.description,
            sort_order: preset.sort_order,
            is_active: true,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(getErrorMessage(payload, "Unable to add Liberty role presets."));
        }

        createdCount += 1;
        existingByKey.set(key, { id: "new", role_key: preset.role_key, name: preset.name });
        existingByName.add(name);
      }

      await loadContentResource(teamRolesResource);
      setFormNotice(
        `Liberty roles synced. Created ${createdCount}, updated ${updatedCount}, skipped ${skippedCount}.`,
      );
    } catch (error) {
      setFormNotice(error.message || "Unable to add Liberty role presets.", true);
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
  const isSingleColumnForm = ["team-members", "livestreams"].includes(activeResource.key);
  const fieldsGridClassName =
    isSingleColumnForm
      ? `${styles.fieldsGrid} ${styles.fieldsGridSingle}`
      : styles.fieldsGrid;

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
            {visibleContentResources.map((resource) => {
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
                <div className={fieldsGridClassName}>
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
                  {activeResource.key === "team-roles" ? (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={applyLibertyRolePresets}
                      disabled={Boolean(busyAction)}
                    >
                      Load Liberty Role Presets
                    </button>
                  ) : null}
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
                          <div className={fieldsGridClassName}>
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

                    {activeResource.key === "team-members" &&
                    !itemIsEditing &&
                    Array.isArray(item.roles) &&
                    item.roles.length ? (
                      <div className={styles.memberRoleRow}>
                        {item.roles.map((role) => (
                          <span key={`${item.id}-role-${role.id || role.role_key || role.name}`} className={styles.memberRoleTag}>
                            <img
                              src={getRoleIconUrl(role.role_key, role.name)}
                              alt=""
                              className={styles.memberRoleIcon}
                              loading="lazy"
                            />
                            <span>{role.name || role.role_key || "Role"}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
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
                  {state.items.map((item) => {
                    const monitorItemKey = `${resource.key}:${item.id}`;
                    const isExpanded = Boolean(expandedMonitorItemKeys[monitorItemKey]);
                    return (
                      <article key={item.id} className={styles.monitorItem}>
                        <div className={styles.monitorSummaryRow}>
                          <div className={styles.monitorSummaryMain}>
                            <h4>{item.name || item.email || item.id}</h4>
                            <p className={styles.monitorMetaLine}>
                              {"submitted_at" in item ? formatDateTime(item.submitted_at) : "No submit time"}
                              {"email" in item && item.email ? ` • ${item.email}` : ""}
                            </p>
                          </div>
                          <div className={styles.monitorSummaryActions}>
                            {"status" in item ? (
                              <span className={styles.monitorStatusPill}>
                                {String(item.status || "new")}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              onClick={() => toggleMonitorItemExpanded(resource.key, item.id)}
                              disabled={Boolean(busyAction)}
                            >
                              {isExpanded ? "Hide" : "Open"}
                            </button>
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
                        </div>

                        {isExpanded ? (
                          <div className={styles.monitorDetailGrid}>
                            <p>
                              <strong>Email:</strong> {formatValue(item.email)}
                            </p>
                            <p>
                              <strong>Phone:</strong> {formatValue(item.phone)}
                            </p>

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
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

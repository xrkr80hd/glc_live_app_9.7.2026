"use client";

import {
  IconArchive,
  IconBible,
  IconBroadcast,
  IconCalendarEvent,
  IconChevronDown,
  IconChevronUp,
  IconCloudUpload,
  IconDeviceFloppy,
  IconFolderOpen,
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
  IconShare,
  IconShoppingCart,
  IconSpeakerphone,
  IconTrash,
  IconUsersGroup,
  IconX
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const SUPPRESSED_ADMIN_TOGGLE_FIELDS = new Set(["is_active", "is_published"]);

function isSuppressedAdminToggleField(name) {
  return SUPPRESSED_ADMIN_TOGGLE_FIELDS.has(String(name || "").trim());
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function preserveViewportPosition(update) {
  if (typeof window === "undefined") {
    update();
    return;
  }

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  update();

  window.requestAnimationFrame(() => {
    window.scrollTo(scrollX, scrollY);
    window.requestAnimationFrame(() => {
      window.scrollTo(scrollX, scrollY);
    });
  });
}

function loadImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () =>
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    image.onerror = reject;
    image.src = src;
  });
}

function buildCroppedUploadFileName(fileName, aspectLabel) {
  const baseName = String(fileName || "")
    .trim()
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const normalizedAspect = String(aspectLabel || "cropped")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "x")
    .replace(/^x+|x+$/g, "");

  return `${baseName || "announcement-image"}-${normalizedAspect || "cropped"}.jpg`;
}

function getMediaUploadPreviewEntries(resource, item) {
  if (!resource || !item) {
    return [];
  }

  return (resource.fields || [])
    .filter((field) => {
      const accept = String(field?.upload?.accept || "").toLowerCase();
      return accept === "image/*" || accept === "video/*";
    })
    .map((field) => {
      const url = String(item?.[field.name] || "").trim();
      if (!url) {
        return null;
      }
      const accept = String(field?.upload?.accept || "").toLowerCase();
      return {
        name: field.name,
        label: field.label,
        url,
        mediaType: accept === "video/*" ? "video" : "image",
      };
    })
    .filter(Boolean);
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
        fullWidth: true,
        options: [
          { value: "main", label: "Main" },
          { value: "youth", label: "Youth" },
        ],
        required: true,
        defaultValue: "main",
      },
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Announcement title", fullWidth: true },
      { name: "body", label: "Body", type: "textarea", required: true, placeholder: "Announcement details", rows: 5, fullWidth: true },
      {
        name: "image_url",
        label: "Image (Optional)",
        type: "text",
        fullWidth: true,
        upload: {
          folder: "announcements/images",
          accept: "image/*",
          helperText: "Optional: drag and drop or browse files to upload.",
          uploadOnly: true,
          crop: {
            aspectOptions: [
              { label: "16:9", value: 16 / 9, outputWidth: 1600 },
              { label: "4:3", value: 4 / 3, outputWidth: 1600 },
            ],
            defaultAspect: 16 / 9,
            quality: 0.92,
            mimeType: "image/jpeg",
          },
        },
      },
      { name: "starts_at", label: "Starts At", type: "datetime", defaultValue: () => getNowDateTimeInput(), compact: true },
      { name: "ends_at", label: "Ends At", type: "datetime", compact: true },
    ],
    preview: [
      { label: "Category", name: "category" },
      { label: "Starts", name: "starts_at", format: formatDateTime },
      { label: "Ends", name: "ends_at", format: formatDateTime },
      { label: "Posted", name: "created_at", format: formatDateTime },
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
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Men's Fellowship", fullWidth: true },
      { name: "body", label: "Body", type: "textarea", required: true, placeholder: "Service time and details...", rows: 5, fullWidth: true },
      {
        name: "image_url",
        label: "Image (Optional)",
        type: "text",
        fullWidth: true,
        upload: {
          folder: "ministries/images",
          accept: "image/*",
          helperText: "Optional: drag and drop or browse files to upload.",
          uploadOnly: true,
          crop: {
            aspectOptions: [
              { label: "16:9", value: 16 / 9, outputWidth: 1600 },
              { label: "4:3", value: 4 / 3, outputWidth: 1600 },
            ],
            defaultAspect: 16 / 9,
            quality: 0.92,
            mimeType: "image/jpeg",
          },
        },
      },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Body", name: "body" },
      { label: "Image URL", name: "image_url" },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "team-roles",
    label: "Team Roles",
    singularLabel: "Team Role",
    description: "Create and manage ministry role definitions (Pastor, Media Team, Youth Minister, etc.).",
    hidden: true,
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
    hidden: true,
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
    hidden: true,
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
    hidden: true,
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
    hidden: true,
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
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Date", name: "album_date", format: formatDate },
      { label: "Sort", name: "sort_order" },
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
    ],
    preview: [
      { label: "Album", name: "album_title" },
      { label: "Photo URL", name: "photo_url" },
      { label: "Date", name: "taken_on", format: formatDate },
      { label: "Sort", name: "sort_order" },
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
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Video URL", name: "video_url" },
      { label: "Recorded", name: "recorded_on", format: formatDate },
      { label: "Sort", name: "sort_order" },
    ],
  },
  {
    key: "scriptures",
    label: "Scripture OTW",
    singularLabel: "Scripture",
    description: "Edit the youth scripture of the week and Lean In text.",
    icon: IconBible,
    listEndpoint: "/api/admin/scriptures?audience=youth&include_unpublished=true&limit=120",
    createEndpoint: "/api/admin/scriptures",
    itemEndpoint: (id) => `/api/admin/scriptures/${id}`,
    listKey: "scriptures",
    fields: [
      { name: "title", label: "Title", type: "text", placeholder: "Built for This Week" },
      { name: "reference", label: "Scripture", type: "text", required: true, placeholder: "John 3:16" },
      { name: "verse_text", label: "Scripture Text", type: "textarea", required: true, placeholder: "Verse text...", rows: 7, fullWidth: true },
      { name: "devotional_text", label: "Lean In", type: "textarea", placeholder: "Write the devotional reflection here...", rows: 6, fullWidth: true },
      { name: "week_start", label: "Week Start", type: "date", required: true, defaultValue: () => getNowDateInput() },
      { name: "week_end", label: "Week End", type: "date", required: true, defaultValue: () => getNowDateInput() },
      { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Title", name: "title" },
      { label: "Scripture", name: "reference" },
      { label: "Week Start", name: "week_start", format: formatDate },
      { label: "Week End", name: "week_end", format: formatDate },
      { label: "Published", name: "is_published" },
    ],
  },
  {
    key: "youth-banners",
    label: "Youth Ticker",
    singularLabel: "Youth Ticker",
    description: "Manage the ticker text shown on the youth page.",
    icon: IconPhoto,
    listEndpoint: "/api/admin/youth-banners?include_inactive=true&limit=120",
    createEndpoint: "/api/admin/youth-banners",
    itemEndpoint: (id) => `/api/admin/youth-banners/${id}`,
    listKey: "youthBanners",
    fields: [
      { name: "subtitle", label: "Ticker Text", type: "textarea", required: true, placeholder: "Sundays @ 9:20 AM - Youth Devotion | Pop-Up Events - Check back for more info", rows: 5, fullWidth: true },
      { name: "starts_at", label: "Starts At", type: "datetime", defaultValue: () => getNowDateTimeInput() },
      { name: "ends_at", label: "Ends At", type: "datetime" },
      { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
    ],
    preview: [
      { label: "Ticker", name: "subtitle" },
      { label: "Starts", name: "starts_at", format: formatDateTime },
      { label: "Ends", name: "ends_at", format: formatDateTime },
      { label: "Active", name: "is_active" },
    ],
  },
  {
    key: "livestreams",
    label: "Livestream",
    singularLabel: "Livestream",
    description: "Save the stream settings, then switch the public live page live or back to the fallback loop.",
    icon: IconBroadcast,
    listEndpoint: "/api/admin/livestreams?include_inactive=true&limit=120",
    createEndpoint: "/api/admin/livestreams",
    itemEndpoint: (id) => `/api/admin/livestreams/${id}`,
    listKey: "livestreams",
    fields: [
      { name: "title", label: "Stream Title", type: "text", required: true, placeholder: "Sunday Service Live", fullWidth: true },
      { name: "embed_url", label: "Stream Link or Embed", type: "text", required: true, placeholder: "Paste the YouTube live, share, watch, or embed link", fullWidth: true },
      {
        name: "fallback_video_url",
        label: "Fallback Video",
        type: "text",
        fullWidth: true,
        upload: {
          folder: "livestream/fallback",
          accept: "video/*",
          helperText: "Upload the looping fallback video used when the stream is offline.",
          uploadOnly: true,
        },
      },
    ],
    preview: [
      { label: "Stream Title", name: "title" },
      { label: "Saved Stream", name: "embed_url" },
      { label: "Fallback Video", name: "fallback_video_url" },
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
    description: "Track and process incoming prayer submissions from public forms.",
    icon: IconMessageCircleHeart,
    endpoint: "/api/admin/prayer-requests?limit=150",
    listKey: "prayerRequests",
    itemEndpoint: (id) => `/api/admin/prayer-requests/${id}`,
  },
  {
    key: "visit-requests",
    label: "Visit Requests",
    description: "Review visitor connection requests submitted on the website.",
    icon: IconMapPin,
    endpoint: "/api/admin/visit-requests?limit=150",
    listKey: "visitRequests",
    itemEndpoint: (id) => `/api/admin/visit-requests/${id}`,
  },
];

const SIDEBAR_RESOURCE_GROUPS = [
  {
    key: "main-page",
    label: "Main Page",
    resourceKeys: ["announcements", "ministries", "seasonal-features", "social-links"],
  },
  {
    key: "youth-page",
    label: "Youth Page",
    resourceKeys: ["scriptures", "youth-banners", "photo-albums", "album-photos", "gallery-videos"],
  },
  {
    key: "live-stream-sermons",
    label: "Live Stream / Sermons",
    resourceKeys: ["livestreams", "service-song-lists", "sermons", "archived-sermons"],
  },
  {
    key: "team-access",
    label: "Team & Access",
    resourceKeys: ["team-roles", "team-members", "team-member-roles"],
  },
  {
    key: "operations",
    label: "Operations",
    resourceKeys: ["ministry-order-requests", "bookkeeping-reports"],
  },
  {
    key: "requests",
    label: "Requests",
    resourceKeys: ["prayer-requests", "visit-requests"],
  },
];

const SIDEBAR_GROUP_BY_RESOURCE_KEY = SIDEBAR_RESOURCE_GROUPS.reduce((map, group) => {
  group.resourceKeys.forEach((resourceKey) => {
    map[resourceKey] = group.key;
  });
  return map;
}, {});

const DRAWER_HIDDEN_RESOURCE_KEYS = new Set(["album-photos", "gallery-videos"]);

function groupSidebarResources(resources) {
  const resourcesByKey = resources.reduce((map, resource) => {
    map[resource.key] = resource;
    return map;
  }, {});

  const groups = SIDEBAR_RESOURCE_GROUPS.map((group) => ({
    ...group,
    resources: group.resourceKeys.map((resourceKey) => resourcesByKey[resourceKey]).filter(Boolean),
  })).filter((group) => group.resources.length > 0);

  const groupedKeys = new Set(groups.flatMap((group) => group.resources.map((resource) => resource.key)));
  const ungroupedResources = resources.filter((resource) => !groupedKeys.has(resource.key));

  if (ungroupedResources.length) {
    groups.push({
      key: "other",
      label: "Other",
      resources: ungroupedResources,
    });
  }

  return groups;
}

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

function getCreateButtonLabel(resource) {
  if (!resource) {
    return "Post Item";
  }
  if (resource.key === "livestreams") {
    return "Save Stream Settings";
  }
  if (resource.key === "scriptures") {
    return "Post Devotional";
  }
  if (resource.key === "announcements") {
    return "Post Announcement";
  }
  if (resource.key === "ministries") {
    return "Post Ministry";
  }
  return `Add ${getSingularLabel(resource)}`;
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
  const cropConfig = field?.upload?.crop || null;
  const cropAspectOptions =
    Array.isArray(cropConfig?.aspectOptions) && cropConfig.aspectOptions.length
      ? cropConfig.aspectOptions
      : [{ label: "16:9", value: 16 / 9, outputWidth: 1600 }];
  const defaultCropAspect = cropConfig?.defaultAspect || cropAspectOptions[0].value;
  const fieldClassName = [
    styles.field,
    field.fullWidth ? styles.fieldWide : "",
    field.compact ? styles.fieldCompact : "",
  ]
    .filter(Boolean)
    .join(" ");
  const uploadInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [multiSearch, setMultiSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUploadAccordionOpen, setIsUploadAccordionOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState("");
  const [cropDimensions, setCropDimensions] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [cropAspect, setCropAspect] = useState(defaultCropAspect);
  const [cropFileName, setCropFileName] = useState("");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const selectedCropOption =
    cropAspectOptions.find((option) => Math.abs(option.value - cropAspect) < 0.0001) ||
    cropAspectOptions[0];
  const cropPreviewWidth = 320;
  const cropPreviewHeight = Math.round(cropPreviewWidth / selectedCropOption.value);

  const cropMetrics = useMemo(() => {
    if (!cropDimensions?.width || !cropDimensions?.height || !cropConfig) {
      return null;
    }

    const baseScale = Math.max(
      cropPreviewWidth / cropDimensions.width,
      cropPreviewHeight / cropDimensions.height,
    );
    const scaledWidth = cropDimensions.width * baseScale * cropZoom;
    const scaledHeight = cropDimensions.height * baseScale * cropZoom;

    return {
      scaledWidth,
      scaledHeight,
      maxOffsetX: Math.max(0, (scaledWidth - cropPreviewWidth) / 2),
      maxOffsetY: Math.max(0, (scaledHeight - cropPreviewHeight) / 2),
    };
  }, [cropConfig, cropDimensions, cropPreviewHeight, cropPreviewWidth, cropZoom]);

  const cropPreviewStyle = useMemo(() => {
    if (!cropSourceUrl || !cropMetrics) {
      return null;
    }

    const clampedX = clamp(cropOffsetX, -cropMetrics.maxOffsetX, cropMetrics.maxOffsetX);
    const clampedY = clamp(cropOffsetY, -cropMetrics.maxOffsetY, cropMetrics.maxOffsetY);

    return {
      width: `${cropMetrics.scaledWidth}px`,
      height: `${cropMetrics.scaledHeight}px`,
      transform: `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`,
    };
  }, [cropMetrics, cropOffsetX, cropOffsetY, cropSourceUrl]);

  useEffect(() => {
    if (!cropMetrics) {
      return;
    }

    setCropOffsetX((current) => clamp(current, -cropMetrics.maxOffsetX, cropMetrics.maxOffsetX));
    setCropOffsetY((current) => clamp(current, -cropMetrics.maxOffsetY, cropMetrics.maxOffsetY));
  }, [cropMetrics]);

  useEffect(() => {
    let active = true;

    if (!cropSourceUrl) {
      setCropDimensions(null);
      return undefined;
    }

    loadImageDimensions(cropSourceUrl)
      .then((nextDimensions) => {
        if (active) {
          setCropDimensions(nextDimensions);
        }
      })
      .catch(() => {
        if (active) {
          setUploadError("We could not load that image. Please choose it again.");
          setCropDimensions(null);
        }
      });

    return () => {
      active = false;
    };
  }, [cropSourceUrl]);

  useEffect(() => {
    if (!isCropModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        closeCropModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCropModalOpen]);

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

  function getUploadSupportText(acceptPattern) {
    const accept = String(acceptPattern || "").trim().toLowerCase();
    if (!accept || accept === "*/*") {
      return "Supports common file types.";
    }
    if (accept === "image/*") {
      return "Supports JPG, PNG, WEBP, and GIF.";
    }
    if (accept === "video/*") {
      return "Supports common video formats.";
    }
    return `Supports ${acceptPattern}.`;
  }

  function fileMatchesAccept(file, acceptPattern) {
    const accept = String(acceptPattern || "").trim();
    if (!accept || accept === "*/*") {
      return true;
    }
    const mimeType = String(file?.type || "").toLowerCase();
    const fileName = String(file?.name || "").toLowerCase();
    const acceptedTypes = accept
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    if (!acceptedTypes.length) {
      return true;
    }

    return acceptedTypes.some((entry) => {
      if (entry === "*/*") {
        return true;
      }
      if (entry.endsWith("/*")) {
        return mimeType.startsWith(entry.slice(0, -1));
      }
      if (entry.startsWith(".")) {
        return fileName.endsWith(entry);
      }
      return mimeType === entry;
    });
  }

  async function uploadFile(file) {
    if (!file || !uploadConfig) {
      return;
    }
    if (!fileMatchesAccept(file, uploadConfig.accept)) {
      setUploadError(`Please choose a supported file type (${uploadConfig.accept}).`);
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

  function onDropzoneDragOver(event) {
    event.preventDefault();
    if (isUploading) {
      return;
    }
    setIsDragActive(true);
  }

  function onDropzoneDragLeave(event) {
    event.preventDefault();
    const nextTarget = event.relatedTarget;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsDragActive(false);
  }

  function onDropzoneDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    if (isUploading) {
      return;
    }
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  if (inputType === "text" && uploadConfig) {
    const uploadPreviewUrl = String(value || "").trim();
    const acceptPattern = String(uploadConfig.accept || "").toLowerCase();
    const showImageUploadPreview = acceptPattern === "image/*" && uploadPreviewUrl;
    const showVideoUploadPreview = acceptPattern === "video/*" && uploadPreviewUrl;
    const showMediaUploadPreview = Boolean(showImageUploadPreview || showVideoUploadPreview);
    const uploadStateText = uploadedFileName
      ? isUploading
        ? `Uploading ${uploadedFileName}`
        : `Selected: ${uploadedFileName}`
      : String(value || "").trim()
        ? "File uploaded and ready."
        : "";

    function clearUploadedImage() {
      if (isUploading) {
        return;
      }
      setUploadedFileName("");
      setUploadError("");
      onChange(field.name, "");
    }

    if (uploadOnly) {
      const uploadCard = (
        <div className={showMediaUploadPreview ? styles.uploadSplitRow : undefined}>
          <label
            htmlFor={`${inputId}-upload`}
            className={`${styles.uploadDropzoneCard}${isDragActive ? ` ${styles.uploadDropzoneDragging}` : ""}`}
            tabIndex={0}
            aria-disabled={isUploading}
            onKeyDown={(event) => {
              if (isUploading) {
                return;
              }
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                uploadInputRef.current?.click();
              }
            }}
            onDragEnter={onDropzoneDragOver}
            onDragOver={onDropzoneDragOver}
            onDragLeave={onDropzoneDragLeave}
            onDrop={onDropzoneDrop}
          >
            <input
              ref={uploadInputRef}
              id={`${inputId}-upload`}
              type="file"
              accept={uploadConfig.accept || "*/*"}
              className={styles.uploadHiddenInput}
              onChange={onFileInputChange}
            />
            <div className={styles.uploadDropzoneIcon}>
              <IconCloudUpload size={40} stroke={1.75} aria-hidden="true" />
            </div>
            <div className={styles.uploadDropzoneCopy}>
              <strong>{isUploading ? "Uploading file..." : "Drag and drop files here"}</strong>
              <p>{isUploading ? "Please wait while the upload finishes." : "or click to browse"}</p>
              <span>{getUploadSupportText(uploadConfig.accept)}</span>
            </div>
            <span className={`${styles.uploadBrowseBtn}${isUploading ? ` ${styles.uploadBrowseBtnDisabled}` : ""}`}>
              <IconFolderOpen size={18} stroke={1.9} aria-hidden="true" />
              {isUploading ? "Uploading..." : "Browse Files"}
            </span>
          </label>
          {showMediaUploadPreview ? (
            <button
              type="button"
              className={styles.uploadThumbButton}
              onClick={clearUploadedImage}
              disabled={isUploading}
              aria-label={`Remove ${field.label}`}
              title={showVideoUploadPreview ? "Click to remove video" : "Click to remove image"}
            >
              {showVideoUploadPreview ? (
                <video src={uploadPreviewUrl} className={styles.uploadThumb} muted playsInline preload="metadata" />
              ) : (
                <img src={uploadPreviewUrl} alt={`${field.label} preview`} className={styles.uploadThumb} loading="lazy" />
              )}
              <span className={styles.uploadThumbHint}>
                {showVideoUploadPreview ? "Click preview to remove video" : "Click thumbnail to remove"}
              </span>
            </button>
          ) : null}
        </div>
      );

      return (
        <div className={`${fieldClassName} ${styles.uploadField}`}>
          {!uploadConfig.accordion ? <span>{field.label}</span> : null}
          {uploadConfig.accordion ? (
            <div className={styles.uploadAccordion}>
              <button
                type="button"
                className={styles.uploadAccordionToggle}
                onClick={() => setIsUploadAccordionOpen((current) => !current)}
                aria-expanded={isUploadAccordionOpen}
              >
                <span>{uploadConfig.accordionLabel || field.label}</span>
                {isUploadAccordionOpen ? <IconChevronUp size={16} stroke={1.9} aria-hidden="true" /> : <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />}
              </button>
              {isUploadAccordionOpen ? <div className={styles.uploadAccordionBody}>{uploadCard}</div> : null}
            </div>
          ) : (
            uploadCard
          )}
          {uploadStateText ? <p className={styles.uploadFileName}>{uploadStateText}</p> : null}
          {uploadConfig.helperText ? <p className={styles.uploadHint}>{uploadConfig.helperText}</p> : null}
          {uploadError ? <p className={styles.uploadError}>{uploadError}</p> : null}
        </div>
      );
    }

    return (
      <div className={fieldClassName}>
        <span>{field.label}</span>
        <input
          id={inputId}
          type="text"
          value={value}
          required={Boolean(field.required)}
          placeholder={field.placeholder || ""}
          readOnly={uploadOnly}
          onChange={(event) => {
            if (!uploadOnly) {
              onChange(field.name, event.target.value);
            }
          }}
        />
        <div className={styles.uploadGroup}>
          <div className={showImageUploadPreview ? styles.uploadSplitRow : undefined}>
            <div>
              <div
                className={`${styles.uploadDropzone}${isDragActive ? ` ${styles.uploadDropzoneDragging}` : ""}`}
                role="button"
                tabIndex={0}
                aria-disabled={isUploading}
                onClick={() => {
                  if (!isUploading) {
                    uploadInputRef.current?.click();
                  }
                }}
                onKeyDown={(event) => {
                  if (isUploading) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    uploadInputRef.current?.click();
                  }
                }}
                onDragEnter={onDropzoneDragOver}
                onDragOver={onDropzoneDragOver}
                onDragLeave={onDropzoneDragLeave}
                onDrop={onDropzoneDrop}
              >
                <span>{isUploading ? "Uploading file..." : "Drop file here or click Browse Files"}</span>
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
                  {isUploading ? "Uploading..." : "Browse Files"}
                </button>
                {uploadedFileName ? (
                  <span className={styles.uploadFileName}>
                    {isUploading ? `Uploading: ${uploadedFileName}` : `Selected: ${uploadedFileName}`}
                  </span>
                ) : null}
              </div>
            </div>
            {showImageUploadPreview ? (
              <button
                type="button"
                className={styles.uploadThumbButton}
                onClick={clearUploadedImage}
                disabled={isUploading}
                aria-label={`Remove ${field.label}`}
                title="Click to remove image"
              >
                <img src={uploadPreviewUrl} alt={`${field.label} preview`} className={styles.uploadThumb} loading="lazy" />
                <span className={styles.uploadThumbHint}>Click thumbnail to remove</span>
              </button>
            ) : null}
          </div>
          {uploadConfig.helperText ? <p className={styles.uploadHint}>{uploadConfig.helperText}</p> : null}
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
          {value ? (
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          ) : null}
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
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </label>
  );
}

function LivestreamAccordion({ label, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.formAccordionCard}>
      <button
        type="button"
        className={styles.formAccordionToggle}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        {isOpen ? <IconChevronUp size={16} stroke={1.9} aria-hidden="true" /> : <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />}
      </button>
      {isOpen ? <div className={styles.formAccordionBody}>{children}</div> : null}
    </div>
  );
}

function LivestreamMonitor({ item }) {
  const fallbackVideo =
    String(item?.fallback_video_url || "").trim() ||
    process.env.NEXT_PUBLIC_FALLBACK_STREAM_VIDEO_URL ||
    "/assets/stream_fallback_loop/stream_fall_back_loop.mp4";
  const isLive = Boolean(item?.is_active && item?.embed_url);

  return (
    <div className={styles.livestreamMonitorPanel}>
      <div className={styles.livestreamMonitorStage}>
        {isLive && item?.embed_url ? (
          <iframe
            src={item.embed_url}
            title={item.title || "Live Stream Preview"}
            className={styles.livestreamMonitorFrame}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : fallbackVideo ? (
          <video className={styles.livestreamMonitorVideo} autoPlay muted loop playsInline preload="metadata">
            <source src={fallbackVideo} />
          </video>
        ) : (
          <div className={styles.livestreamMonitorEmpty}>Add a fallback video to preview the offline state.</div>
        )}
      </div>
      <div className={styles.livestreamMonitorMeta}>
        <p>
          <strong>Showing:</strong> {isLive ? "Live stream" : "Fallback loop"}
        </p>
        <p>
          <strong>Stream Title:</strong> {formatValue(item?.title)}
        </p>
        <p className={styles.livestreamMonitorNote}>
          {isLive
            ? "This is the player the public live page will show while the stream is active."
            : "When you stop the stream, the public live page returns to this looping fallback video."}
        </p>
      </div>
    </div>
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
  const [collapsedListByResource, setCollapsedListByResource] = useState({
    announcements: true,
    ministries: true,
  });
  const [collapsedCreateFormByResource, setCollapsedCreateFormByResource] = useState({
    announcements: true,
    ministries: true,
  });
  const [expandedMonitorItemKeys, setExpandedMonitorItemKeys] = useState({});
  const [expandedNavGroups, setExpandedNavGroups] = useState({
    "main-page": true,
    "youth-page": true,
    "albums-media": true,
    "live-stream-sermons": true,
    requests: true,
  });
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
  const visibleMonitorResources = useMemo(() => MONITOR_RESOURCES, []);
  const visibleSidebarResources = useMemo(
    () =>
      [...visibleContentResources, ...visibleMonitorResources].filter(
        (resource) => !DRAWER_HIDDEN_RESOURCE_KEYS.has(resource.key),
      ),
    [visibleContentResources, visibleMonitorResources],
  );
  const groupedSidebarResources = useMemo(
    () => groupSidebarResources(visibleSidebarResources),
    [visibleSidebarResources],
  );
  const activeSidebarGroupKey = SIDEBAR_GROUP_BY_RESOURCE_KEY[activeResourceKey] || "other";

  const activeContentResource = useMemo(
    () =>
      visibleContentResources.find((resource) => resource.key === activeResourceKey) || null,
    [activeResourceKey, visibleContentResources],
  );
  const activeMonitorResource = useMemo(
    () =>
      visibleMonitorResources.find((resource) => resource.key === activeResourceKey) || null,
    [activeResourceKey, visibleMonitorResources],
  );
  const activeResource = useMemo(
    () =>
      activeContentResource ||
      activeMonitorResource ||
      visibleSidebarResources[0] ||
      CONTENT_RESOURCES[0] ||
      MONITOR_RESOURCES[0],
    [activeContentResource, activeMonitorResource, visibleSidebarResources],
  );
  const visibleFormFields = useMemo(
    () =>
      (activeContentResource?.fields || []).filter(
        (field) => field.name !== "sort_order" && !isSuppressedAdminToggleField(field.name),
      ),
    [activeContentResource],
  );
  const visiblePreviewEntries = useMemo(
    () =>
      (activeContentResource?.preview || []).filter(
        (entry) => entry.name !== "sort_order" && !isSuppressedAdminToggleField(entry.name),
      ),
    [activeContentResource],
  );
  const activeRelationResourceKeys = useMemo(() => {
    if (!activeContentResource) {
      return [];
    }
    const keys = activeContentResource.fields
      .filter(
        (field) =>
          (field.type === "relation" || field.type === "relation_multi") &&
          field.relationResourceKey,
      )
      .map((field) => field.relationResourceKey);
    return Array.from(new Set(keys));
  }, [activeContentResource]);

  useEffect(() => {
    if (!visibleSidebarResources.length) {
      return;
    }
    const hasActive = visibleSidebarResources.some(
      (resource) => resource.key === activeResourceKey,
    );
    if (!hasActive) {
      setActiveResourceKey(visibleSidebarResources[0].key);
    }
  }, [activeResourceKey, visibleSidebarResources]);

  useEffect(() => {
    if (!activeSidebarGroupKey) {
      return;
    }
    setExpandedNavGroups((prev) => {
      if (prev[activeSidebarGroupKey]) {
        return prev;
      }
      return {
        ...prev,
        [activeSidebarGroupKey]: true,
      };
    });
  }, [activeSidebarGroupKey]);

  function toggleNavGroup(groupKey) {
    preserveViewportPosition(() => {
      setExpandedNavGroups((prev) => ({
        ...prev,
        [groupKey]: !prev[groupKey],
      }));
    });
  }

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
    if (!activeContentResource) {
      return;
    }

    const state = contentState[activeContentResource.key];
    if (!state.loaded && !state.loading) {
      loadContentResource(activeContentResource);
    }
  }, [activeContentResource, contentState, loadContentResource]);

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
  useEffect(() => {
    if (!activeMonitorResource) {
      return;
    }
    const state = monitorState[activeMonitorResource.key];
    if (!state?.loaded && !state?.loading) {
      loadMonitorResource(activeMonitorResource);
    }
  }, [activeMonitorResource, loadMonitorResource, monitorState]);

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
    preserveViewportPosition(() => {
      setExpandedItemIdByResource((prev) => ({
        ...prev,
        [resourceKey]: prev[resourceKey] === itemId ? "" : itemId,
      }));
    });
  }

  function toggleResourceListCollapsed(resourceKey) {
    preserveViewportPosition(() => {
      setCollapsedListByResource((prev) => ({
        ...prev,
        [resourceKey]: !prev[resourceKey],
      }));
    });
  }

  function toggleCreateFormCollapsed(resourceKey) {
    preserveViewportPosition(() => {
      setCollapsedCreateFormByResource((prev) => ({
        ...prev,
        [resourceKey]: !prev[resourceKey],
      }));
    });
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

  async function reorderContentItems(resourceKey, itemId, direction) {
    if (busyAction) {
      return;
    }
    const resource = CONTENT_RESOURCES.find((entry) => entry.key === resourceKey);
    if (!resource) {
      return;
    }

    const currentItems = contentState[resource.key]?.items || [];
    const currentIndex = currentItems.findIndex((item) => String(item.id) === String(itemId));
    if (currentIndex < 0) {
      return;
    }
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentItems.length) {
      return;
    }

    const actionKey = `reorder:${resource.key}:${itemId}:${direction}`;
    setBusyAction(actionKey);
    setFormNotice("");

    try {
      const reordered = [...currentItems];
      const [movedItem] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, movedItem);

      for (let index = 0; index < reordered.length; index += 1) {
        const nextSortOrder = (index + 1) * 10;
        const row = reordered[index];
        const existingSortOrder = Number.parseInt(String(row?.sort_order ?? ""), 10);
        if (Number.isFinite(existingSortOrder) && existingSortOrder === nextSortOrder) {
          continue;
        }
        const response = await fetch(resource.itemEndpoint(row.id), {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sort_order: nextSortOrder }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(getErrorMessage(payload, `Unable to reorder ${resource.label.toLowerCase()}.`));
        }
      }

      await loadContentResource(resource);
      setFormNotice(`${getSingularLabel(resource)} order updated.`);
    } catch (error) {
      setFormNotice(error.message || `Unable to reorder ${resource.label.toLowerCase()}.`, true);
    } finally {
      setBusyAction("");
    }
  }

  async function setLivestreamMode(itemId, shouldGoLive) {
    const resource = CONTENT_RESOURCES.find((entry) => entry.key === "livestreams");
    if (!resource || busyAction) {
      return;
    }

    const items = contentState[resource.key]?.items || [];
    const target = items.find((item) => String(item.id) === String(itemId));
    if (!target) {
      return;
    }
    if (shouldGoLive && !String(target.embed_url || "").trim()) {
      setFormNotice("Save a stream link or embed before going live.", true);
      return;
    }
    if (!shouldGoLive && typeof window !== "undefined") {
      const shouldStop = window.confirm("Stop the live stream and return the public page to the fallback video?");
      if (!shouldStop) {
        return;
      }
    }

    const actionKey = `livestream-mode:${itemId}:${shouldGoLive ? "live" : "fallback"}`;
    const viewport =
      typeof window !== "undefined"
        ? { x: window.scrollX, y: window.scrollY }
        : null;
    preserveViewportPosition(() => {
      setBusyAction(actionKey);
      setFormNotice("");
    });

    try {
      if (shouldGoLive) {
        const activeItems = items.filter((item) => item.is_active && String(item.id) !== String(itemId));
        for (const activeItem of activeItems) {
          const response = await fetch(resource.itemEndpoint(activeItem.id), {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ is_active: false }),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(getErrorMessage(payload, "Unable to switch livestream mode."));
          }
        }
      }

      const response = await fetch(resource.itemEndpoint(itemId), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: Boolean(shouldGoLive) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Unable to switch livestream mode."));
      }

      await loadContentResource(resource);
      if (viewport && typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          window.scrollTo(viewport.x, viewport.y);
          window.requestAnimationFrame(() => {
            window.scrollTo(viewport.x, viewport.y);
          });
        });
      }
      setFormNotice(shouldGoLive ? "Stream is live." : "Stream returned to the fallback video.");
    } catch (error) {
      setFormNotice(error.message || "Unable to switch livestream mode.", true);
    } finally {
      setBusyAction("");
    }
  }

  const refreshActiveResource = useCallback(() => {
    if (activeContentResource) {
      loadContentResource(activeContentResource);
      return;
    }
    if (activeMonitorResource) {
      loadMonitorResource(activeMonitorResource);
    }
  }, [activeContentResource, activeMonitorResource, loadContentResource, loadMonitorResource]);

  const activeState = activeContentResource
    ? contentState[activeContentResource.key] || {
      items: [],
      loading: false,
      loaded: false,
      error: "",
    }
    : {
      items: [],
      loading: false,
      loaded: false,
      error: "",
    };
  const activeMonitorState = activeMonitorResource
    ? monitorState[activeMonitorResource.key] || {
      items: [],
      loading: false,
      loaded: false,
      error: "",
    }
    : {
      items: [],
      loading: false,
      loaded: false,
      error: "",
    };
  const editingId = activeContentResource ? editingIdByResource[activeContentResource.key] || "" : "";
  const expandedId = activeContentResource ? expandedItemIdByResource[activeContentResource.key] || "" : "";
  const createDraft =
    activeContentResource
      ? createDrafts[activeContentResource.key] || getInitialDraft(activeContentResource.fields)
      : {};
  const editDraft = activeContentResource ? editDrafts[activeContentResource.key] || {} : {};
  const useAccordionCards = ["seasonal-features", "announcements"].includes(activeContentResource?.key || "");
  const useCompactMediaRow = activeContentResource?.key === "seasonal-features";
  const usePostedListAccordion = ["announcements", "ministries"].includes(activeContentResource?.key || "");
  const isPostedListCollapsed = usePostedListAccordion
    ? Boolean(collapsedListByResource[activeContentResource?.key || ""])
    : false;
  const useCreateFormAccordion = ["announcements", "ministries"].includes(activeContentResource?.key || "");
  const isCreateFormCollapsed = useCreateFormAccordion
    ? Boolean(collapsedCreateFormByResource[activeContentResource?.key || ""])
    : false;
  const isSingleColumnForm = ["team-members", "livestreams"].includes(activeContentResource?.key || "");
  const fieldsGridClassName =
    isSingleColumnForm
      ? `${styles.fieldsGrid} ${styles.fieldsGridSingle}`
      : styles.fieldsGrid;
  const isLivestreamResource = activeContentResource?.key === "livestreams";
  const livestreamTitleField = isLivestreamResource ? visibleFormFields.find((field) => field.name === "title") : null;
  const livestreamEmbedField = isLivestreamResource ? visibleFormFields.find((field) => field.name === "embed_url") : null;
  const livestreamFallbackField = isLivestreamResource ? visibleFormFields.find((field) => field.name === "fallback_video_url") : null;

  function renderLivestreamEditor({ draft, onDraftChange, onSubmit, idPrefix, submitLabel }) {
    return (
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className={fieldsGridClassName}>
          {livestreamTitleField ? (
            <FieldInput
              field={livestreamTitleField}
              value={draft[livestreamTitleField.name]}
              relationOptions={getRelationOptionsForField(livestreamTitleField)}
              onChange={onDraftChange}
              idPrefix={idPrefix}
            />
          ) : null}
        </div>

        {livestreamEmbedField ? (
          <LivestreamAccordion label="Live Stream">
            <div className={`${styles.fieldsGrid} ${styles.fieldsGridSingle}`}>
              <FieldInput
                field={livestreamEmbedField}
                value={draft[livestreamEmbedField.name]}
                relationOptions={getRelationOptionsForField(livestreamEmbedField)}
                onChange={onDraftChange}
                idPrefix={idPrefix}
              />
            </div>
          </LivestreamAccordion>
        ) : null}

        {livestreamFallbackField ? (
          <LivestreamAccordion label="Fallback Video" defaultOpen={false}>
            <div className={`${styles.fieldsGrid} ${styles.fieldsGridSingle}`}>
              <FieldInput
                field={livestreamFallbackField}
                value={draft[livestreamFallbackField.name]}
                relationOptions={getRelationOptionsForField(livestreamFallbackField)}
                onChange={onDraftChange}
                idPrefix={idPrefix}
              />
            </div>
          </LivestreamAccordion>
        ) : null}

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryBtn} disabled={Boolean(busyAction)}>
            <IconDeviceFloppy size={16} stroke={1.9} aria-hidden="true" />
            {submitLabel}
          </button>
        </div>
        <p className={styles.livestreamActionHint}>Save stream settings first. Then use the live controls below.</p>
      </form>
    );
  }

  function renderLivestreamPreview(item) {
    const isLive = Boolean(item?.is_active);
    const hasSavedStream = Boolean(String(item?.embed_url || "").trim());
    const hasFallbackVideo = Boolean(String(item?.fallback_video_url || "").trim());

    return (
      <div className={styles.livestreamPanelStack}>
        <div className={styles.previewGrid}>
          <p>
            <strong>Saved stream:</strong> {hasSavedStream ? "Ready" : "Not set yet"}
          </p>
          <p>
            <strong>Fallback video:</strong> {hasFallbackVideo ? "Ready" : "Using the site fallback loop"}
          </p>
          <p>
            <strong>Created:</strong> {formatDateTime(item?.created_at)}
          </p>
        </div>

        <div className={styles.livestreamControlBox}>
          <p className={styles.livestreamStatusText}>Status: {isLive ? "Live now" : "Offline"}</p>
          <div className={styles.livestreamControlButtons}>
            <button
              type="button"
              className={!isLive ? styles.primaryBtn : styles.secondaryBtn}
              onClick={() => setLivestreamMode(item.id, true)}
              disabled={Boolean(busyAction) || !hasSavedStream}
            >
              Go Live
            </button>
            <button
              type="button"
              className={isLive ? styles.dangerBtn : styles.secondaryBtn}
              onClick={() => setLivestreamMode(item.id, false)}
              disabled={Boolean(busyAction)}
            >
              Stop Live
            </button>
          </div>
        </div>

        <LivestreamAccordion label="Stream Monitor" defaultOpen={false}>
          <LivestreamMonitor item={item} />
        </LivestreamAccordion>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.brandBlock}>
          <h1>Liberty Church Admin</h1>
          <p className={styles.metaLine}>Signed in: {username}</p>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.topActionLink}
            onClick={refreshActiveResource}
            disabled={Boolean(busyAction)}
          >
            <IconRefresh size={16} stroke={1.9} aria-hidden="true" />
            Refresh
          </button>
          <Link className={styles.topActionLink} href="/" target="_blank" rel="noreferrer">
            Visit Site
          </Link>
          <button type="button" className={styles.topActionLink} onClick={onLogout} disabled={Boolean(busyAction)}>
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

        {isNavOpen ? (
          <button
            type="button"
            className={styles.navBackdrop}
            onClick={() => setIsNavOpen(false)}
            aria-label="Close content menu"
          />
        ) : null}

        <div className={styles.managerLayout}>
          <button
            type="button"
            className={`${styles.resourceNavLauncher} ${isNavOpen ? styles.resourceNavLauncherOpen : ""}`}
            onClick={() => setIsNavOpen((prev) => !prev)}
            aria-expanded={isNavOpen}
            aria-controls="admin-resource-menu"
            aria-label={isNavOpen ? "Close content menu" : "Open content menu"}
          >
            {isNavOpen ? <IconX size={14} stroke={1.9} aria-hidden="true" /> : <IconMenu2 size={14} stroke={1.9} aria-hidden="true" />}
          </button>
          <aside id="admin-resource-menu" className={`${styles.resourceNav} ${isNavOpen ? styles.resourceNavOpen : ""}`} aria-label="Admin resources">
            {groupedSidebarResources.map((group) => {
              const isExpanded = expandedNavGroups[group.key] ?? group.key === activeSidebarGroupKey;
              return (
                <section key={group.key} className={styles.navGroup}>
                  <button
                    type="button"
                    className={styles.navGroupToggle}
                    onClick={() => toggleNavGroup(group.key)}
                    aria-expanded={isExpanded}
                  >
                    <span>{group.label}</span>
                    <span className={styles.navGroupMeta}>
                      {isExpanded ? <IconChevronUp size={15} stroke={1.9} aria-hidden="true" /> : <IconChevronDown size={15} stroke={1.9} aria-hidden="true" />}
                    </span>
                  </button>
                  {isExpanded ? (
                    <div className={styles.navGroupItems}>
                      {group.resources.map((resource) => {
                        const Icon = resource.icon;
                        const isActive = resource.key === activeResourceKey;
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
                    </div>
                  ) : null}
                </section>
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
              <p>{activeResource.description || "Manage records for this section."}</p>
              {activeContentResource?.readOnlyMessage ? (
                <p className={styles.readOnlyHint}>{activeResource.readOnlyMessage}</p>
              ) : null}
            </div>

            {activeContentResource && !activeContentResource.readOnly ? (
              <div className={useCreateFormAccordion ? styles.formAccordionCard : undefined}>
                {useCreateFormAccordion ? (
                  <button
                    type="button"
                    className={styles.formAccordionToggle}
                    onClick={() => toggleCreateFormCollapsed(activeContentResource.key)}
                    aria-expanded={!isCreateFormCollapsed}
                  >
                    <span>
                      {activeContentResource.key === "announcements" ? "New Announcement" : "New Ministry / Service Time"}
                    </span>
                    {isCreateFormCollapsed ? <IconChevronDown size={16} stroke={1.9} aria-hidden="true" /> : <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />}
                  </button>
                ) : null}
                {!useCreateFormAccordion || !isCreateFormCollapsed ? (
                  isLivestreamResource ? (
                    renderLivestreamEditor({
                      draft: createDraft,
                      onDraftChange: (fieldName, nextValue) => onCreateDraftChange(activeContentResource.key, fieldName, nextValue),
                      onSubmit: () => createItem(activeContentResource),
                      idPrefix: `create-${activeContentResource.key}`,
                      submitLabel: "Save Stream Settings",
                    })
                  ) : (
                    <form
                      className={styles.form}
                      onSubmit={(event) => {
                        event.preventDefault();
                        createItem(activeContentResource);
                      }}
                    >
                      <div className={fieldsGridClassName}>
                        {visibleFormFields.map((field) => (
                          <FieldInput
                            key={`create-${activeContentResource.key}-${field.name}`}
                            field={field}
                            value={createDraft[field.name]}
                            relationOptions={getRelationOptionsForField(field)}
                            onChange={(fieldName, nextValue) => onCreateDraftChange(activeContentResource.key, fieldName, nextValue)}
                            idPrefix={`create-${activeContentResource.key}`}
                          />
                        ))}
                      </div>
                      <div className={styles.formActions}>
                        <button type="submit" className={styles.primaryBtn} disabled={Boolean(busyAction)}>
                          <IconPlus size={17} stroke={1.9} aria-hidden="true" />
                          {getCreateButtonLabel(activeContentResource)}
                        </button>
                        {activeContentResource.key === "team-roles" ? (
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
                  )
                ) : null}
              </div>
            ) : null}

            {activeContentResource ? (
              <>
                {activeState.error ? (
                  <p className={styles.tableError} role="alert">
                    {activeState.error}
                  </p>
                ) : null}

                {activeState.loading && !activeState.loaded ? (
                  <p className={styles.loading}>
                    Loading {activeContentResource.label.toLowerCase()}...
                  </p>
                ) : null}

                {usePostedListAccordion ? (
                  <div className={styles.formAccordionCard}>
                    <button
                      type="button"
                      className={styles.formAccordionToggle}
                      onClick={() => toggleResourceListCollapsed(activeContentResource.key)}
                      aria-expanded={!isPostedListCollapsed}
                    >
                      <span>{activeContentResource.key === "announcements" ? "Posted Announcements" : "Posted Service Times"}</span>
                      {isPostedListCollapsed ? <IconChevronDown size={16} stroke={1.9} aria-hidden="true" /> : <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />}
                    </button>
                    {!isPostedListCollapsed ? (
                      <div className={`${styles.listWrap} ${styles.formAccordionBody}`}>
                        {activeState.items.length === 0 && activeState.loaded ? <p className={styles.empty}>No records found.</p> : null}

                        {activeState.items.map((item, itemIndex) => {
                          const itemIsEditing = editingId === item.id;
                          const itemIsExpanded = useAccordionCards ? expandedId === item.id || itemIsEditing : true;
                          const compactMediaType = String(item.media_type || "none").toLowerCase() || "none";
                          const compactSeconds = Number.parseInt(String(item.display_seconds ?? 12), 10) || 12;
                          const compactVolume = Number.parseInt(String(item.volume_percent ?? 25), 10) || 25;
                          const itemImagePreviews = getMediaUploadPreviewEntries(activeContentResource, item);
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
                                      onClick={() => toggleItemExpanded(activeContentResource.key, item.id)}
                                      disabled={Boolean(busyAction)}
                                      aria-label={itemIsExpanded ? "Collapse item" : "Open item"}
                                    >
                                      {itemIsExpanded ? (
                                        <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />
                                      ) : (
                                        <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />
                                      )}
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    className={styles.secondaryBtn}
                                    onClick={() => reorderContentItems(activeContentResource.key, item.id, "up")}
                                    disabled={Boolean(busyAction) || itemIndex === 0}
                                  >
                                    <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />
                                    Up
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.secondaryBtn}
                                    onClick={() => reorderContentItems(activeContentResource.key, item.id, "down")}
                                    disabled={Boolean(busyAction) || itemIndex === activeState.items.length - 1}
                                  >
                                    <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />
                                    Down
                                  </button>
                                  {!activeContentResource.readOnly ? (
                                    <>
                                      <button
                                        type="button"
                                        className={styles.secondaryBtn}
                                        onClick={() => (itemIsEditing ? cancelEdit(activeContentResource.key) : startEdit(activeContentResource, item))}
                                        disabled={Boolean(busyAction)}
                                      >
                                        {itemIsEditing ? <IconX size={16} stroke={1.9} aria-hidden="true" /> : <IconPencil size={16} stroke={1.9} aria-hidden="true" />}
                                        {itemIsEditing ? "Cancel" : "Edit"}
                                      </button>
                                      <button
                                        type="button"
                                        className={styles.dangerBtn}
                                        onClick={() => deleteItem(activeContentResource, item.id)}
                                        disabled={Boolean(busyAction)}
                                      >
                                        <IconTrash size={16} stroke={1.9} aria-hidden="true" />
                                        Delete
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </div>

                              {!itemIsEditing && itemImagePreviews.length ? (
                                <div className={styles.itemThumbRow}>
                                  {itemImagePreviews.map((preview) => (
                                    <figure key={`${item.id}-${preview.name}`} className={styles.itemThumbCard}>
                                      {preview.mediaType === "video" ? (
                                        <video src={preview.url} className={styles.itemThumbImage} muted playsInline preload="metadata" />
                                      ) : (
                                        <img src={preview.url} alt={`${preview.label} thumbnail`} className={styles.itemThumbImage} loading="lazy" />
                                      )}
                                      <figcaption>{preview.label}</figcaption>
                                    </figure>
                                  ))}
                                </div>
                              ) : null}

                              {itemIsExpanded ? (
                                itemIsEditing ? (
                                  <form
                                    className={styles.form}
                                    onSubmit={(event) => {
                                      event.preventDefault();
                                      saveItem(activeContentResource, item.id);
                                    }}
                                  >
                                    <div className={fieldsGridClassName}>
                                      {visibleFormFields.map((field) => (
                                        <FieldInput
                                          key={`edit-${item.id}-${field.name}`}
                                          field={field}
                                          value={editDraft[field.name]}
                                          relationOptions={getRelationOptionsForField(field)}
                                          onChange={(fieldName, nextValue) => onEditDraftChange(activeContentResource.key, fieldName, nextValue)}
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
                                    {visiblePreviewEntries.map((entry) => {
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
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className={styles.listWrap}>
                    {activeState.items.length === 0 && activeState.loaded ? <p className={styles.empty}>No records found.</p> : null}

                    {activeState.items.map((item, itemIndex) => {
                      const itemIsEditing = editingId === item.id;
                      const itemIsExpanded = useAccordionCards ? expandedId === item.id || itemIsEditing : true;
                      const compactMediaType = String(item.media_type || "none").toLowerCase() || "none";
                      const compactSeconds = Number.parseInt(String(item.display_seconds ?? 12), 10) || 12;
                      const compactVolume = Number.parseInt(String(item.volume_percent ?? 25), 10) || 25;
                      const itemImagePreviews = getMediaUploadPreviewEntries(activeContentResource, item);
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
                                  onClick={() => toggleItemExpanded(activeContentResource.key, item.id)}
                                  disabled={Boolean(busyAction)}
                                  aria-label={itemIsExpanded ? "Collapse item" : "Open item"}
                                >
                                  {itemIsExpanded ? (
                                    <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />
                                  ) : (
                                    <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />
                                  )}
                                </button>
                              ) : null}
                              {activeContentResource.key === "announcements" || activeContentResource.key === "ministries" ? (
                                <>
                                  <button
                                    type="button"
                                    className={styles.secondaryBtn}
                                    onClick={() => reorderContentItems(activeContentResource.key, item.id, "up")}
                                    disabled={Boolean(busyAction) || itemIndex === 0}
                                  >
                                    <IconChevronUp size={16} stroke={1.9} aria-hidden="true" />
                                    Up
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.secondaryBtn}
                                    onClick={() => reorderContentItems(activeContentResource.key, item.id, "down")}
                                    disabled={Boolean(busyAction) || itemIndex === activeState.items.length - 1}
                                  >
                                    <IconChevronDown size={16} stroke={1.9} aria-hidden="true" />
                                    Down
                                  </button>
                                </>
                              ) : null}
                              {!activeContentResource.readOnly ? (
                                <>
                                  <button
                                    type="button"
                                    className={styles.secondaryBtn}
                                    onClick={() => (itemIsEditing ? cancelEdit(activeContentResource.key) : startEdit(activeContentResource, item))}
                                    disabled={Boolean(busyAction)}
                                  >
                                    {itemIsEditing ? <IconX size={16} stroke={1.9} aria-hidden="true" /> : <IconPencil size={16} stroke={1.9} aria-hidden="true" />}
                                    {itemIsEditing ? "Cancel" : "Edit"}
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.dangerBtn}
                                    onClick={() => deleteItem(activeContentResource, item.id)}
                                    disabled={Boolean(busyAction)}
                                  >
                                    <IconTrash size={16} stroke={1.9} aria-hidden="true" />
                                    Delete
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {useCompactMediaRow ? (
                            <div className={styles.compactMetaRow}>
                              <span className={styles.compactMetaPill}>Media: {compactMediaType}</span>
                              <span className={styles.compactMetaPill}>Seconds: {compactSeconds}</span>
                              <span className={styles.compactMetaPill}>Volume: {compactVolume}</span>
                            </div>
                          ) : null}

                          {!itemIsEditing && itemImagePreviews.length ? (
                            <div className={styles.itemThumbRow}>
                              {itemImagePreviews.map((preview) => (
                                <figure key={`${item.id}-${preview.name}`} className={styles.itemThumbCard}>
                                  {preview.mediaType === "video" ? (
                                    <video src={preview.url} className={styles.itemThumbImage} muted playsInline preload="metadata" />
                                  ) : (
                                    <img src={preview.url} alt={`${preview.label} thumbnail`} className={styles.itemThumbImage} loading="lazy" />
                                  )}
                                  <figcaption>{preview.label}</figcaption>
                                </figure>
                              ))}
                            </div>
                          ) : null}

                          {itemIsExpanded ? (
                            itemIsEditing ? (
                              isLivestreamResource ? (
                                renderLivestreamEditor({
                                  draft: editDraft,
                                  onDraftChange: (fieldName, nextValue) => onEditDraftChange(activeContentResource.key, fieldName, nextValue),
                                  onSubmit: () => saveItem(activeContentResource, item.id),
                                  idPrefix: `edit-${item.id}`,
                                  submitLabel: "Save Stream Settings",
                                })
                              ) : (
                                <form
                                  className={styles.form}
                                  onSubmit={(event) => {
                                    event.preventDefault();
                                    saveItem(activeContentResource, item.id);
                                  }}
                                >
                                  <div className={fieldsGridClassName}>
                                    {visibleFormFields.map((field) => (
                                      <FieldInput
                                        key={`edit-${item.id}-${field.name}`}
                                        field={field}
                                        value={editDraft[field.name]}
                                        relationOptions={getRelationOptionsForField(field)}
                                        onChange={(fieldName, nextValue) => onEditDraftChange(activeContentResource.key, fieldName, nextValue)}
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
                              )
                            ) : (
                              isLivestreamResource ? renderLivestreamPreview(item) : (
                                <div className={styles.previewGrid}>
                                  {visiblePreviewEntries.map((entry) => {
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
                            )
                          ) : (
                            !useAccordionCards ? (
                              isLivestreamResource ? renderLivestreamPreview(item) : (
                                <div className={styles.previewGrid}>
                                  {visiblePreviewEntries.slice(0, 3).map((entry) => {
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
                            ) : null
                          )}

                          {activeContentResource.key === "team-members" &&
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
                )}
              </>
            ) : activeMonitorResource ? (
              <>
                {activeMonitorState.error ? (
                  <p className={styles.tableError} role="alert">
                    {activeMonitorState.error}
                  </p>
                ) : null}
                {activeMonitorState.loading && !activeMonitorState.loaded ? <p className={styles.loading}>Loading...</p> : null}
                <div className={styles.listWrap}>
                  {activeMonitorState.items.length === 0 && activeMonitorState.loaded ? <p className={styles.empty}>No requests found.</p> : null}
                  <div className={styles.monitorList}>
                    {activeMonitorState.items.map((item) => {
                      const monitorItemKey = `${activeMonitorResource.key}:${item.id}`;
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
                                onClick={() => toggleMonitorItemExpanded(activeMonitorResource.key, item.id)}
                                disabled={Boolean(busyAction)}
                              >
                                {isExpanded ? "Hide" : "Open"}
                              </button>
                              <button
                                type="button"
                                className={styles.dangerBtn}
                                onClick={() => deleteMonitorItem(activeMonitorResource, item.id)}
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
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

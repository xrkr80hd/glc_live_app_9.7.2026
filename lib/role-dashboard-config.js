import {
  getMemberRoleKeys,
  hasAnyRole,
  normalizeRoleKeyForPolicy,
} from "@/lib/admin-role-access";
import { getCurrentMemberFromServerCookies } from "@/lib/member-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DASHBOARD_PRIORITY = [
  "superuser",
  "pastor",
  "bookkeeper",
  "youth",
  "youthAssistant",
  "musicMinister",
  "media",
  "foh",
  "worship",
  "kids",
  "member",
];

function createStats(scope, tools, visibility) {
  return [
    { label: "Scope", value: scope },
    { label: "Core Tools", value: tools },
    { label: "Visibility", value: visibility },
  ];
}

export function normalizeDashboardRoleKey(value) {
  return normalizeRoleKeyForPolicy(value);
}

export const DASHBOARD_CONFIG = {
  member: {
    key: "member",
    slug: "member",
    path: "/dashboard/member",
    label: "General Member",
    title: "Member Dashboard",
    subtitle: "Quick access to announcements, prayer, directory, and account tools.",
    kicker: "Role Dashboard",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: [],
    stats: createStats("Member tools", "4 essentials", "Standard member"),
    heroTitle: "Your week-at-a-glance dashboard",
    heroBody:
      "This view stays simple on purpose. It keeps everyday Liberty Church tools easy to reach without mixing in staff-only controls.",
    primaryHeading: "Everyday Church Tools",
    primaryDescription: "Open the most-used member destinations from one place.",
    primaryTools: [
      {
        label: "Announcements",
        description: "Read the latest church-wide updates and event posts.",
        href: "/member/announcements",
        icon: "content",
      },
      {
        label: "Prayer Wall",
        description: "See approved requests and stay connected in prayer.",
        href: "/member/prayer/wall",
        icon: "prayer",
      },
      {
        label: "Church Directory",
        description: "Open the member directory and contact list.",
        href: "/member/directory",
        icon: "people",
      },
      {
        label: "Settings",
        description: "Manage notifications, profile, and app preferences.",
        href: "/member/settings",
        icon: "settings",
      },
    ],
    groups: [
      {
        title: "Stay Connected",
        description: "Open the standard member routes used through the week.",
        items: [
          {
            label: "Profile",
            description: "View your member profile, photo, and contact details.",
            href: "/member/profile",
            icon: "profile",
          },
          {
            label: "Sermons",
            description: "Watch recent messages and revisit the sermon library.",
            href: "/member/sermons",
            icon: "media",
          },
          {
            label: "Give",
            description: "Open the giving flow and submit your gift.",
            href: "/member/give",
            icon: "finance",
          },
        ],
      },
    ],
    callout: {
      title: "Role-aware expansion",
      body:
        "If your account has additional ministry roles, those dashboards appear in the switcher above without changing the standard member experience.",
    },
  },
  worship: {
    key: "worship",
    slug: "worship",
    path: "/dashboard/worship",
    label: "Worship Team",
    title: "Worship Team Dashboard",
    subtitle: "Service plans, assigned songs, and rehearsal notes in one mobile-first workspace.",
    kicker: "Role Dashboard",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["worship_team"],
    stats: createStats("Team prep", "4 core panels", "Assigned role only"),
    heroTitle: "Get ready for the next set",
    heroBody:
      "Keep the next service in view, see what songs are assigned, and stay synced with rehearsal notes before you arrive.",
    primaryHeading: "Core Worship Tools",
    primaryDescription: "These cards mirror the top-level actions shown in the worship anchor.",
    primaryTools: [
      {
        label: "My Service Plans",
        description: "Track the next service order and your placement inside it.",
        icon: "planning",
      },
      {
        label: "Song Book",
        description: "Open the shared song library and keep reference material together.",
        icon: "media",
      },
      {
        label: "Assigned Songs",
        description: "See the songs tied to your upcoming service assignment.",
        icon: "content",
      },
      {
        label: "Rehearsal Notes",
        description: "Keep rehearsal reminders and flow notes easy to scan.",
        icon: "docs",
      },
    ],
    groups: [
      {
        title: "Sunday Readiness",
        description: "Clean placeholders for live planning data until backend wiring lands.",
        items: [
          {
            label: "Call Time",
            description: "Show rehearsal and arrival timing once service-plan data is connected.",
            icon: "time",
            disabled: true,
          },
          {
            label: "Stage Notes",
            description: "Surface arrangement notes and ministry reminders in one feed.",
            icon: "content",
            disabled: true,
          },
          {
            label: "Prayer Focus",
            description: "Keep pre-service prayer notes visible for the team.",
            icon: "prayer",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Backend wiring next",
      body:
        "This dashboard is ready for real service-plan, song assignment, and rehearsal-note data when those ministry endpoints are exposed to members.",
    },
  },
  musicMinister: {
    key: "musicMinister",
    slug: "music-minister",
    path: "/dashboard/music-minister",
    label: "Music Minister",
    title: "Music Minister Dashboard",
    subtitle: "Lead the worship flow, manage songs, and submit ministry requests from one view.",
    kicker: "Role Dashboard",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["worship_leader"],
    stats: createStats("Worship leadership", "6 leadership tools", "Assigned role only"),
    heroTitle: "Lead the full worship planning loop",
    heroBody:
      "This dashboard expands the worship-team view with song management, scheduling controls, and ministry request tracking.",
    primaryHeading: "Leadership Actions",
    primaryDescription: "Top-level tools aligned to the Music Minister anchor.",
    primaryTools: [
      {
        label: "Scheduled Songs",
        description: "Shape the upcoming set and keep the team aligned around the plan.",
        icon: "planning",
      },
      {
        label: "Manage Songs",
        description: "Add, update, and organize the song catalog for future services.",
        icon: "settings",
      },
      {
        label: "Record Rehearsal",
        description: "Track rehearsal notes and capture what changed before Sunday.",
        icon: "docs",
      },
      {
        label: "Order Requests",
        description: "Prepare purchase requests for Pastor review when worship needs arise.",
        icon: "finance",
      },
    ],
    groups: [
      {
        title: "Support Tools",
        description: "Secondary actions stay visible without overcrowding the main hero area.",
        items: [
          {
            label: "My Service Plans",
            description: "Keep the current service order one tap away.",
            icon: "planning",
            disabled: true,
          },
          {
            label: "Announcement Publisher",
            description: "Open publishing tools when announcement permissions are wired for this role.",
            icon: "content",
            disabled: true,
          },
          {
            label: "Rehearsal Notes",
            description: "Keep rehearsal comments grouped with the service plan.",
            icon: "docs",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Pastor-first review flow",
      body:
        "The dashboard is shaped around submitting worship needs upward to Pastor without changing the existing backend approval model.",
    },
  },
  media: {
    key: "media",
    slug: "media",
    path: "/dashboard/media",
    label: "Media Team",
    title: "Media Team Dashboard",
    subtitle: "Prep the service, support livestream flow, and keep production assets organized.",
    kicker: "Role Dashboard",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["media_team"],
    stats: createStats("Production prep", "6 media tools", "Assigned role only"),
    heroTitle: "Production-ready before the room opens",
    heroBody:
      "Use this dashboard for run-of-show visibility, livestream prep, and the media assets needed to carry the service well.",
    primaryHeading: "Media Controls",
    primaryDescription: "The first row follows the emphasis of the Media Team anchor.",
    primaryTools: [
      {
        label: "Run of Show",
        description: "See the service flow, transitions, and cue order.",
        icon: "planning",
      },
      {
        label: "Media Prep",
        description: "Keep slides, graphics, and media assets grouped before service.",
        icon: "content",
      },
      {
        label: "Livestream Controls",
        description: "Jump into the livestream workflow when live controls are connected.",
        icon: "live",
      },
      {
        label: "Graphics",
        description: "Track lower-thirds, loops, and visual assets in one place.",
        icon: "settings",
      },
    ],
    groups: [
      {
        title: "Service Assets",
        description: "These rows are ready to bind to real production data later.",
        items: [
          {
            label: "Song Lyrics",
            description: "Connect lyric sources and display-ready copy for service use.",
            icon: "content",
            disabled: true,
          },
          {
            label: "Sermon Slides",
            description: "Surface the latest sermon deck and presentation updates.",
            icon: "media",
            disabled: true,
          },
          {
            label: "Order Requests",
            description: "Submit production needs upward for Pastor review.",
            icon: "finance",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Current integration scope",
      body:
        "The UI is intentionally ready for livestream, slides, and graphics connections without changing any existing admin APIs or permissions.",
    },
  },
  foh: {
    key: "foh",
    slug: "foh",
    path: "/dashboard/foh",
    label: "FOH Sound",
    title: "FOH Sound Dashboard",
    subtitle: "Run-of-show flow, sound-check cues, and set-focused notes for the sound team.",
    kicker: "Role Dashboard",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["foh_sound"],
    stats: createStats("Sound booth", "5 sound tools", "Assigned role only"),
    heroTitle: "Keep the room ready before the first song starts",
    heroBody:
      "The FOH screen prioritizes what matters in the booth: the service order, sound-check focus, microphone readiness, and the current set.",
    primaryHeading: "FOH Essentials",
    primaryDescription: "The first row stays tightly aligned to the FOH anchor hierarchy.",
    primaryTools: [
      {
        label: "Run of Show",
        description: "Keep the service flow visible from the booth.",
        icon: "planning",
      },
      {
        label: "Sound Check",
        description: "Use this panel for room and channel check steps.",
        icon: "settings",
      },
      {
        label: "Microphone Assignments",
        description: "Track who is on which channel before service begins.",
        icon: "people",
      },
      {
        label: "Current Setlist",
        description: "Keep the active set in view while mixing.",
        icon: "content",
      },
    ],
    groups: [
      {
        title: "Reference Tools",
        description: "Support material stays close without crowding the main actions.",
        items: [
          {
            label: "Tech Docs",
            description: "Surface booth notes and technical docs once they are available.",
            icon: "docs",
            disabled: true,
          },
          {
            label: "Order Requests",
            description: "Submit sound-equipment needs to Pastor for review.",
            icon: "finance",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Booth-friendly layout",
      body:
        "The screen stays clean and quick to scan so a sound operator can move through it one-handed on mobile when needed.",
    },
  },
  youth: {
    key: "youth",
    slug: "youth",
    path: "/dashboard/youth",
    label: "Youth Minister",
    title: "Youth Minister Dashboard",
    subtitle: "Lead youth ministry operations, preview the student-facing site, and run the room with confidence.",
    kicker: "Youth Ministry",
    theme: "youth",
    navKey: "youth",
    showInSwitcher: true,
    requiredRoleKeys: ["youth_minister"],
    stats: createStats("Youth ministry", "4 core tools", "Youth leadership"),
    heroTitle: "The final Youth Minister dashboard route",
    heroBody:
      "This screen treats the 6.2a anchor as the primary youth leadership dashboard and keeps theme controls, preview, and run-of-show work grouped under it.",
    primaryHeading: "Youth Leadership Tools",
    primaryDescription: "The top row reflects the main actions called out across the youth anchors.",
    primaryTools: [
      {
        label: "Theme Studio",
        description: "Open the youth theme customization screen.",
        href: "/dashboard/youth/theme",
        icon: "settings",
      },
      {
        label: "Live Preview",
        description: "See what students will see before anything goes live.",
        href: "/dashboard/youth/preview",
        icon: "live",
      },
      {
        label: "Run of Show",
        description: "Open the youth service flow and transition plan.",
        href: "/dashboard/youth/run-of-show",
        icon: "planning",
      },
      {
        label: "Student Site",
        description: "Jump to the current youth-facing member page.",
        href: "/member/youth",
        icon: "youth",
      },
    ],
    groups: [
      {
        title: "Leadership Workflow",
        description: "Operational items are grouped clearly for youth leadership.",
        items: [
          {
            label: "Order Requests",
            description: "Track ministry needs that should move to Pastor for approval.",
            icon: "finance",
            disabled: true,
          },
          {
            label: "Assistant Dashboard",
            description: "Open the separate youth assistant dashboard with fewer top-level controls.",
            href: "/dashboard/youth/assistant",
            icon: "people",
          },
          {
            label: "Publishing Queue",
            description: "Show youth content waiting to publish once that workflow is wired.",
            icon: "content",
            disabled: true,
          },
        ],
      },
      {
        title: "Week Flow",
        description: "Keep upcoming student-facing rhythm visible from the main youth hub.",
        items: [
          {
            label: "Devotional Rhythm",
            description: "Link the next devotional post and teaching plan here.",
            icon: "docs",
            disabled: true,
          },
          {
            label: "Volunteer Notes",
            description: "Keep volunteer reminders and room notes easy to scan.",
            icon: "people",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Youth theme guardrail",
      body:
        "Only youth-specific dashboard routes use the dark youth treatment. The standard Liberty Church member theme stays intact everywhere else.",
    },
  },
  youthTheme: {
    key: "youthTheme",
    slug: "youth-theme",
    path: "/dashboard/youth/theme",
    label: "Youth Theme Studio",
    title: "Customize Youth Theme",
    subtitle: "Tune the youth-facing visual direction without touching the broader church theme.",
    kicker: "Youth Ministry Tool",
    theme: "youth",
    navKey: "youth",
    showInSwitcher: false,
    requiredRoleKeys: ["youth_minister"],
    backLink: {
      label: "Back to Youth Dashboard",
      href: "/dashboard/youth",
    },
    stats: createStats("Youth-only", "4 design panels", "Youth Minister"),
    heroTitle: "Design controls for the youth module",
    heroBody:
      "This screen follows the 6.1 anchor and keeps the customization flow focused on youth visuals, hero treatment, and message emphasis.",
    primaryHeading: "Theme Controls",
    primaryDescription: "UI-only controls are grouped clearly while backend publishing remains untouched.",
    primaryTools: [
      {
        label: "Color Direction",
        description: "Preview how the youth accent palette should shift across the module.",
        icon: "settings",
      },
      {
        label: "Hero Media",
        description: "Stage youth hero media and visual atmosphere choices.",
        icon: "live",
      },
      {
        label: "CTA Labels",
        description: "Shape the student-facing action labels before publishing.",
        icon: "content",
      },
      {
        label: "Preview Handoff",
        description: "Move straight into the live preview screen to review changes.",
        href: "/dashboard/youth/preview",
        icon: "planning",
      },
    ],
    groups: [
      {
        title: "Design Notes",
        description: "Keep visual changes understandable for non-technical ministry leaders.",
        items: [
          {
            label: "Message Tone",
            description: "Guide how headlines, cards, and calls to action should feel.",
            icon: "docs",
            disabled: true,
          },
          {
            label: "Student Landing Priority",
            description: "Highlight the sections that matter most on the youth-facing site.",
            icon: "youth",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "UI-only by design",
      body:
        "This route prepares the theme-editing experience visually without changing backend publishing or permissions in this workstream.",
    },
  },
  youthPreview: {
    key: "youthPreview",
    slug: "youth-preview",
    path: "/dashboard/youth/preview",
    label: "Youth Site Preview",
    title: "Youth Site Live Preview",
    subtitle: "Preview what students will see before a youth update is pushed live.",
    kicker: "Youth Ministry Tool",
    theme: "youth",
    navKey: "youth",
    showInSwitcher: false,
    requiredRoleKeys: ["youth_minister", "youth_minister_assistant"],
    backLink: {
      label: "Back to Youth Dashboard",
      href: "/dashboard/youth",
    },
    stats: createStats("Student view", "Preview panels", "Youth leadership"),
    heroTitle: "Preview before publish",
    heroBody:
      "This screen uses the 6.2b anchor as the source of truth for a youth-facing preview step before content goes out to students.",
    primaryHeading: "Preview Panels",
    primaryDescription: "Scan the pieces students notice first before you push anything live.",
    primaryTools: [
      {
        label: "Hero Preview",
        description: "Confirm the landing headline, media, and first call to action.",
        icon: "live",
      },
      {
        label: "This Week",
        description: "Review devotional and event emphasis in the order students will see it.",
        icon: "planning",
      },
      {
        label: "Quick Links",
        description: "Check the student quick links before publishing changes.",
        icon: "content",
      },
      {
        label: "Theme Studio",
        description: "Return to youth theme controls if anything feels off.",
        href: "/dashboard/youth/theme",
        icon: "settings",
      },
    ],
    groups: [
      {
        title: "Preview Checklist",
        description: "Keep launch checks plain-language and easy to scan.",
        items: [
          {
            label: "Student Header",
            description: "Verify the header, tone, and hero treatment feel right for the week.",
            icon: "youth",
            disabled: true,
          },
          {
            label: "Announcement Weight",
            description: "Review whether the right youth update is getting the most emphasis.",
            icon: "content",
            disabled: true,
          },
          {
            label: "Action Labels",
            description: "Keep student calls to action short, clear, and friendly.",
            icon: "planning",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Assistant-friendly access",
      body:
        "Youth Minister Assistants can reach this preview route without gaining full theme-control access.",
    },
  },
  youthRunOfShow: {
    key: "youthRunOfShow",
    slug: "youth-run-of-show",
    path: "/dashboard/youth/run-of-show",
    label: "Youth Run of Show",
    title: "Youth Ministry Run of Show",
    subtitle: "Track the room flow, transitions, and volunteer handoffs for the youth gathering.",
    kicker: "Youth Ministry Tool",
    theme: "youth",
    navKey: "youth",
    showInSwitcher: false,
    requiredRoleKeys: ["youth_minister", "youth_minister_assistant"],
    backLink: {
      label: "Back to Youth Dashboard",
      href: "/dashboard/youth",
    },
    stats: createStats("Service flow", "Run-of-show", "Youth leadership"),
    heroTitle: "Keep the youth room moving cleanly",
    heroBody:
      "This route is the dedicated 6.3 sub-tool screen. It focuses on flow, transitions, and volunteer handoff clarity rather than acting like a separate top-level role.",
    primaryHeading: "Tonight's Flow",
    primaryDescription: "The top row keeps the room sequence visible without clutter.",
    primaryTools: [
      {
        label: "Doors Open",
        description: "Set the room arrival window and volunteer arrival expectation.",
        icon: "time",
      },
      {
        label: "Worship Block",
        description: "Keep the opening worship slot and transitions in view.",
        icon: "media",
      },
      {
        label: "Teaching Slot",
        description: "Track the message segment and speaking handoff.",
        icon: "docs",
      },
      {
        label: "Dismissal",
        description: "Close with the final student flow and next-step reminder.",
        icon: "people",
      },
    ],
    groups: [
      {
        title: "Volunteer Handoffs",
        description: "Keep key transitions visible for the youth room team.",
        items: [
          {
            label: "Check-in Handoff",
            description: "Track who owns the handoff from arrival to the first room moment.",
            icon: "people",
            disabled: true,
          },
          {
            label: "A/V Cues",
            description: "Add visual and audio cue reminders when youth production data is available.",
            icon: "live",
            disabled: true,
          },
          {
            label: "Room Notes",
            description: "Capture practical room reminders without leaving this screen.",
            icon: "content",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Focused sub-tool",
      body:
        "This page exists to keep the youth service flow easy to follow on mobile and should stay scoped to that purpose.",
    },
  },
  youthAssistant: {
    key: "youthAssistant",
    slug: "youth-assistant",
    path: "/dashboard/youth/assistant",
    label: "Youth Minister Assistant",
    title: "Youth Minister Assistant Dashboard",
    subtitle: "A lighter youth leadership dashboard for publishing support, previewing, and room flow help.",
    kicker: "Youth Ministry",
    theme: "youth",
    navKey: "youth",
    showInSwitcher: true,
    requiredRoleKeys: ["youth_minister_assistant", "youth_minister"],
    backLink: {
      label: "Back to Youth Dashboard",
      href: "/dashboard/youth",
    },
    stats: createStats("Support role", "Fewer top tools", "Youth leadership"),
    heroTitle: "A focused assistant view",
    heroBody:
      "This route treats the 6.4 anchor as a separate youth assistant dashboard with fewer top-level controls than the main Youth Minister view.",
    primaryHeading: "Assistant Tools",
    primaryDescription: "Keep the top row practical and limited to what the assistant needs most.",
    primaryTools: [
      {
        label: "Live Preview",
        description: "Preview what students see before youth updates go out.",
        href: "/dashboard/youth/preview",
        icon: "live",
      },
      {
        label: "Run of Show",
        description: "Help the room stay on schedule and easy to manage.",
        href: "/dashboard/youth/run-of-show",
        icon: "planning",
      },
      {
        label: "Youth Updates",
        description: "Prepare youth-facing updates once publishing is fully wired.",
        icon: "content",
      },
      {
        label: "Order Requests",
        description: "Prepare youth ministry requests that still route upward for review.",
        icon: "finance",
      },
    ],
    groups: [
      {
        title: "Shared Leadership Visibility",
        description: "The assistant flow stays aligned with the Youth Minister dashboard.",
        items: [
          {
            label: "Notify Youth Minister",
            description: "Assistant actions should remain visible to the main youth leader.",
            icon: "people",
            disabled: true,
          },
          {
            label: "Student Experience Check",
            description: "Review what feels ready from a student-facing point of view.",
            icon: "youth",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Intentional limits",
      body:
        "This route is deliberately narrower than the main youth dashboard so assistant tasks stay clear and leadership review remains intact.",
    },
  },
  kids: {
    key: "kids",
    slug: "kids",
    path: "/dashboard/kids",
    label: "Kids Ministry",
    title: "Kids Ministry Dashboard",
    subtitle: "Check-in, attendance, lesson planning, and parent communication in one professional workflow.",
    kicker: "Role Dashboard",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["kids_church"],
    stats: createStats("Kids ministry", "6 ministry tools", "Assigned role only"),
    heroTitle: "Professional tools for the kids team",
    heroBody:
      "The kids dashboard keeps the Liberty Church visual system intact while surfacing classroom, safety, and communication tools in a simple mobile stack.",
    primaryHeading: "Kids Ministry Tools",
    primaryDescription: "The first row follows the key actions in the kids ministry anchor.",
    primaryTools: [
      {
        label: "Check-In",
        description: "Start with arrival flow and classroom readiness.",
        icon: "people",
      },
      {
        label: "Attendance",
        description: "Keep weekly attendance and room counts easy to review.",
        icon: "planning",
      },
      {
        label: "Lesson Plan",
        description: "Track what is being taught and what is up next.",
        icon: "docs",
      },
      {
        label: "Parent Messages",
        description: "Keep parent communication close to the weekly classroom flow.",
        icon: "content",
      },
    ],
    groups: [
      {
        title: "Care and Communication",
        description: "Safety and parent-facing items stay grouped together.",
        items: [
          {
            label: "Volunteer Assignments",
            description: "Show who is serving and where they are placed.",
            icon: "people",
            disabled: true,
          },
          {
            label: "Safety / Incident Report",
            description: "Keep safety follow-up visible in the same dashboard.",
            icon: "security",
            disabled: true,
          },
          {
            label: "Emergency Contacts",
            description: "Surface quick family contact access when needed.",
            icon: "content",
            disabled: true,
          },
          {
            label: "Announcements",
            description: "Open the church announcement feed without leaving the kids context.",
            href: "/member/announcements",
            icon: "content",
          },
        ],
      },
    ],
    callout: {
      title: "No cartoon treatment",
      body:
        "The kids ministry route keeps a polished Liberty Church feel instead of drifting into a playful app style that would break the broader design system.",
    },
  },
  pastor: {
    key: "pastor",
    slug: "pastor",
    path: "/dashboard/pastor",
    label: "Pastor",
    title: "Pastor Dashboard",
    subtitle: "Review ministry needs, oversee people and prayer, and keep church operations moving cleanly.",
    kicker: "Pastoral Oversight",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["pastor"],
    stats: createStats("Pastoral oversight", "Wide review scope", "Pastor only"),
    heroTitle: "Pastor-first operations flow",
    heroBody:
      "This dashboard keeps order-request review, bookkeeper reporting, people, prayer, and ministry follow-up close together without changing the existing backend authority model.",
    primaryHeading: "Pastor Priorities",
    primaryDescription: "The first row mirrors the emphasis of the Pastor anchor.",
    primaryTools: [
      {
        label: "Prayer Requests",
        description: "Keep care-related requests near the top of the dashboard.",
        icon: "prayer",
      },
      {
        label: "Order Requests Review",
        description: "Review and decide on ministry requests submitted by team leaders.",
        icon: "finance",
      },
      {
        label: "Bookkeeper Reports",
        description: "Review financial reporting that rolls up from bookkeeping.",
        icon: "finance",
      },
      {
        label: "People + Care",
        description: "Keep people, follow-up, and care work within easy reach.",
        icon: "people",
      },
    ],
    groups: [
      {
        title: "Pastoral Operations",
        description: "Support tools stay grouped and easy to scan on mobile.",
        items: [
          {
            label: "Sermons",
            description: "Keep sermon prep and message-related work visible.",
            href: "/member/sermons",
            icon: "media",
          },
          {
            label: "Upcoming Events",
            description: "View upcoming events and ministry touchpoints.",
            icon: "planning",
            disabled: true,
          },
          {
            label: "Volunteer Teams",
            description: "Track which ministry teams need attention this week.",
            icon: "people",
            disabled: true,
          },
          {
            label: "Announcements",
            description: "Keep church communication close to review workflows.",
            href: "/member/announcements",
            icon: "content",
          },
        ],
      },
    ],
    callout: {
      title: "Review authority preserved",
      body:
        "The UI is shaped around Pastor review authority, but it does not change any underlying approval API or permission behavior in this workstream.",
    },
  },
  bookkeeper: {
    key: "bookkeeper",
    slug: "bookkeeper",
    path: "/dashboard/bookkeeper",
    label: "Bookkeeper",
    title: "Bookkeeper Dashboard",
    subtitle: "Prepare giving summaries, reconcile funds, and send reporting upward to Pastor.",
    kicker: "Financial Reporting",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["bookkeeper"],
    stats: createStats("Reporting scope", "Bookkeeping tools", "Bookkeeper only"),
    heroTitle: "Financial reporting without extra clutter",
    heroBody:
      "This dashboard stays tightly scoped to bookkeeping work: reports, reconciliations, summaries, and the upward reporting flow to Pastor.",
    primaryHeading: "Bookkeeping Tools",
    primaryDescription: "The first row reflects the priorities called out in the Bookkeeper anchor.",
    primaryTools: [
      {
        label: "Giving Reports",
        description: "Open giving reports and financial rollups for the week.",
        icon: "finance",
      },
      {
        label: "Weekly Builder",
        description: "Prepare the weekly report package for review.",
        icon: "planning",
      },
      {
        label: "Monthly Builder",
        description: "Assemble longer-range summaries and month-end reporting.",
        icon: "docs",
      },
      {
        label: "Submit to Pastor",
        description: "Prepare reports for upward review without broadening permissions.",
        icon: "content",
      },
    ],
    groups: [
      {
        title: "Reporting Scope",
        description: "Keep bookkeeping work clearly bounded to the reporting role.",
        items: [
          {
            label: "Tithe Summaries",
            description: "Review tithe summaries and giving categories.",
            icon: "finance",
            disabled: true,
          },
          {
            label: "Fund Designation Reports",
            description: "Track how designated giving maps across active funds.",
            icon: "content",
            disabled: true,
          },
          {
            label: "Donation Reconciliation",
            description: "Keep reconciliations visible without opening wider admin tooling.",
            icon: "settings",
            disabled: true,
          },
          {
            label: "Export Reports",
            description: "Prepare export actions when reporting output is fully wired.",
            icon: "docs",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "Permission guardrail",
      body:
        "This screen intentionally does not expose roles, permissions, youth controls, or broad publishing tools unless the backend access model is explicitly expanded later.",
    },
  },
  superuser: {
    key: "superuser",
    slug: "superuser",
    path: "/dashboard/superuser",
    label: "Superuser",
    title: "Superuser Dashboard",
    subtitle: "Platform-wide visibility across users, roles, content, and reporting workflows.",
    kicker: "System Oversight",
    theme: "member",
    navKey: "more",
    showInSwitcher: true,
    requiredRoleKeys: ["superuser"],
    stats: createStats("Platform-wide", "System controls", "All dashboards"),
    heroTitle: "Highest-level platform control",
    heroBody:
      "This route follows the Superuser anchor with a broad control surface for users, roles, permissions, content, and ministry-wide oversight.",
    primaryHeading: "Superuser Controls",
    primaryDescription: "The first row keeps the heaviest control points up front.",
    primaryTools: [
      {
        label: "Users",
        description: "Review member and team access at the platform level.",
        icon: "people",
      },
      {
        label: "Roles",
        description: "Track role setup and access boundaries across the church app.",
        icon: "security",
      },
      {
        label: "Permissions",
        description: "Keep system-level access rules visible and reviewable.",
        icon: "settings",
      },
      {
        label: "Order Request Oversight",
        description: "Maintain global visibility into ministry request workflows.",
        icon: "finance",
      },
    ],
    groups: [
      {
        title: "Content + Systems",
        description: "Group broad controls without turning the screen into a crowded admin wall.",
        items: [
          {
            label: "Announcements",
            description: "Review church communication surfaces.",
            href: "/member/announcements",
            icon: "content",
          },
          {
            label: "Sermons",
            description: "Keep sermon and message surfaces in view.",
            href: "/member/sermons",
            icon: "media",
          },
          {
            label: "Livestream",
            description: "Review livestream-related control points and visibility.",
            icon: "live",
            disabled: true,
          },
          {
            label: "Bookkeeping Reports",
            description: "Keep financial reporting in the same oversight layer.",
            icon: "finance",
            disabled: true,
          },
          {
            label: "Upload Manager",
            description: "Track central asset handling when file management is surfaced here.",
            icon: "docs",
            disabled: true,
          },
        ],
      },
    ],
    callout: {
      title: "UI-only control layer",
      body:
        "This route does not alter backend authority. It creates the screen structure needed for future system wiring while preserving the existing permission model.",
    },
  },
};

export const TOP_LEVEL_DASHBOARD_KEYS = Object.values(DASHBOARD_CONFIG)
  .filter((config) => config.showInSwitcher)
  .map((config) => config.key);

export function getDashboardConfigByKey(key) {
  return DASHBOARD_CONFIG[key] || null;
}

export function getDashboardConfigBySlug(slug) {
  return Object.values(DASHBOARD_CONFIG).find((config) => config.slug === slug) || null;
}

export function canAccessDashboard(configOrKey, roleKeys, isSuperuser = false) {
  const config = typeof configOrKey === "string" ? getDashboardConfigByKey(configOrKey) : configOrKey;
  if (!config) {
    return false;
  }

  if (config.key === "member") {
    return true;
  }

  if (isSuperuser) {
    return true;
  }

  const normalizedRoleKeys = (Array.isArray(roleKeys) ? roleKeys : [])
    .map(normalizeDashboardRoleKey)
    .filter(Boolean);

  return hasAnyRole(normalizedRoleKeys, config.requiredRoleKeys);
}

export function getAccessibleDashboardKeys(roleKeys, isSuperuser = false) {
  const keys = TOP_LEVEL_DASHBOARD_KEYS.filter((key) => canAccessDashboard(key, roleKeys, isSuperuser));
  if (!keys.includes("member")) {
    keys.unshift("member");
  }
  return keys;
}

export function getPrimaryDashboardKey(roleKeys, isSuperuser = false) {
  const accessibleKeys = getAccessibleDashboardKeys(roleKeys, isSuperuser);
  return DASHBOARD_PRIORITY.find((key) => accessibleKeys.includes(key)) || "member";
}

export function getPrimaryDashboardPath(roleKeys, isSuperuser = false) {
  const primaryKey = getPrimaryDashboardKey(roleKeys, isSuperuser);
  return getDashboardConfigByKey(primaryKey)?.path || "/dashboard/member";
}

export async function getDashboardViewerContext() {
  const currentMember = await getCurrentMemberFromServerCookies();
  if (!currentMember?.member?.id) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const rawRoleKeys = supabase ? await getMemberRoleKeys(supabase, currentMember.member.id) : [];
  const roleKeys = rawRoleKeys.map(normalizeDashboardRoleKey).filter(Boolean);
  const isSuperuser = Boolean(
    roleKeys.includes("superuser") ||
      currentMember.member?.is_superuser ||
      currentMember.session?.isSuperuser,
  );
  const accessibleDashboardKeys = getAccessibleDashboardKeys(roleKeys, isSuperuser);
  const primaryDashboardPath = getPrimaryDashboardPath(roleKeys, isSuperuser);
  const memberName = currentMember.member.full_name || currentMember.session?.fullName || "";
  const firstName = memberName.split(" ").filter(Boolean)[0] || "";

  return {
    currentMember,
    displayName: memberName || currentMember.member.username || "Member",
    firstName,
    roleKeys,
    isSuperuser,
    accessibleDashboardKeys,
    accessibleDashboards: accessibleDashboardKeys
      .map((key) => getDashboardConfigByKey(key))
      .filter(Boolean),
    primaryDashboardPath,
  };
}

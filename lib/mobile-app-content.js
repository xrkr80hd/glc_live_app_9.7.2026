export const homePlaceholders = {
  welcomeMessage: "[WELCOME_MESSAGE]",
  churchIdentityLine: "[CHURCH_IDENTITY_LINE]",
  dailyVerseText: "[DAILY_VERSE_TEXT]",
  dailyVerseReference: "[DAILY_VERSE_REFERENCE]",
  serviceTimePrimary: "[SERVICE_TIME_PRIMARY]",
  serviceTimeSecondary: "[SERVICE_TIME_SECONDARY]",
  serviceLocation: "[SERVICE_LOCATION]",
};

export const announcementCards = Array.from({ length: 3 }, (_, index) => ({
  id: `announcement-${index + 1}`,
  title: "[ANNOUNCEMENT_TITLE]",
  summary: "[ANNOUNCEMENT_SUMMARY]",
  date: "[ANNOUNCEMENT_DATE]",
}));

export const sermonCards = [
  {
    id: "sermon-latest-1",
    title: "[SERMON_TITLE]",
    series: "[SERMON_SERIES]",
    date: "[SERMON_DATE]",
    description: "[SERVICE_DESCRIPTION]",
  },
  {
    id: "sermon-latest-2",
    title: "[SERMON_TITLE]",
    series: "[SERMON_SERIES]",
    date: "[SERMON_DATE]",
    description: "[SERVICE_DESCRIPTION]",
  },
  {
    id: "sermon-featured-1",
    title: "[SERMON_TITLE]",
    series: "[SERMON_SERIES]",
    date: "[SERMON_DATE]",
    description: "[SERVICE_DESCRIPTION]",
  },
];

export const prayerWallCards = [
  {
    id: "prayer-approved-1",
    title: "Prayer Wall Request",
    request: "[PRAYER_REQUEST_TEXT]",
    meta: "Approved for church-wide viewing",
  },
  {
    id: "prayer-approved-2",
    title: "Prayer Wall Request",
    request: "[PRAYER_REQUEST_TEXT]",
    meta: "Posted after moderation review",
  },
  {
    id: "prayer-approved-3",
    title: "Prayer Wall Request",
    request: "[PRAYER_REQUEST_TEXT]",
    meta: "Read-only member view",
  },
];

export const youthDevotionalPlaceholders = {
  title: "[DEVOTIONAL_TITLE]",
  reference: "[BIBLE_REFERENCE]",
  passage: "[SCRIPTURE_PASSAGE]",
  text: "[DEVOTIONAL_TEXT]",
};

export const youthEventPlaceholders = {
  title: "[YOUTH_EVENT_TITLE]",
  date: "[EVENT_DATE]",
  time: "[EVENT_TIME]",
  location: "[EVENT_LOCATION]",
  description: "[EVENT_DESCRIPTION]",
  cta: "[EVENT_CTA_LABEL]",
};

export const profilePlaceholders = {
  name: "[USER_NAME]",
  email: "[USER_EMAIL]",
};

export const directoryEntries = Array.from({ length: 3 }, (_, index) => ({
  id: `directory-${index + 1}`,
  name: "[USER_NAME]",
  email: "[USER_EMAIL]",
  phone: "[USER_PHONE]",
  role: "[MINISTRY_ROLE]",
}));

export const beliefCards = [
  {
    id: "belief-scripture",
    title: "Scripture",
    summary: "The Bible is God's inspired Word and the final guide for faith, doctrine, and daily life.",
  },
  {
    id: "belief-jesus",
    title: "Jesus Christ",
    summary: "Jesus is fully God and fully man, our Savior, risen Lord, and the center of the gospel we preach.",
  },
  {
    id: "belief-salvation",
    title: "Salvation by Grace",
    summary: "We are saved by grace through faith in Jesus Christ, not by works, and made new by the Holy Spirit.",
  },
  {
    id: "belief-spirit",
    title: "The Holy Spirit",
    summary: "The Holy Spirit empowers believers for holy living, witness, prayer, and the building up of the church.",
  },
  {
    id: "belief-church",
    title: "The Church",
    summary: "The church is the body of Christ, gathered for worship, discipleship, community, prayer, and mission.",
  },
  {
    id: "belief-return",
    title: "The Blessed Hope",
    summary: "Jesus will return, judge the living and the dead, and make all things new in His perfect kingdom.",
  },
];

export const announcementNotificationOptions = [
  {
    id: "push-announcements",
    label: "Push Notifications",
    description: "Alert members when new announcements are published.",
    defaultOn: true,
  },
  {
    id: "email-announcements",
    label: "Email Notifications",
    description: "Send announcement updates to the member inbox.",
    defaultOn: true,
  },
  {
    id: "urgent-announcements",
    label: "Urgent Alerts",
    description: "Highlight time-sensitive church-wide announcement updates.",
    defaultOn: false,
  },
];

export const notificationPreferenceGroups = [
  {
    id: "general",
    title: "General Notifications",
    rows: [
      {
        id: "service-reminders",
        label: "Service Reminders",
        description: "Receive reminders before the next worship service.",
        defaultOn: true,
      },
      {
        id: "calendar-updates",
        label: "Calendar Updates",
        description: "Get notified when upcoming dates or times change.",
        defaultOn: true,
      },
    ],
  },
  {
    id: "member-care",
    title: "Member Care",
    rows: [
      {
        id: "prayer-updates",
        label: "Prayer Updates",
        description: "Receive follow-up notifications related to prayer submissions.",
        defaultOn: false,
      },
      {
        id: "care-team",
        label: "Pastoral Care Contact",
        description: "Allow outreach when follow-up is needed.",
        defaultOn: true,
      },
    ],
  },
  {
    id: "youth-family",
    title: "Youth and Family",
    rows: [
      {
        id: "youth-events",
        label: "Youth Event Reminders",
        description: "Receive notices for youth devotional and event updates.",
        defaultOn: true,
      },
      {
        id: "family-updates",
        label: "Family Ministry Updates",
        description: "Keep youth-related reminders visible in the app feed.",
        defaultOn: false,
      },
    ],
  },
];

export const adminPrayerRequests = Array.from({ length: 3 }, (_, index) => ({
  id: `pending-prayer-${index + 1}`,
  request: "[PRAYER_REQUEST_TEXT]",
  submittedBy: "[USER_NAME]",
  destination: index === 0 ? "Prayer Wall (Church Can See After Approval)" : "Pastor + Prayer Team (Private)",
  submittedAt: "[SUBMITTED_DATE]",
  anonymous: index === 1,
}));
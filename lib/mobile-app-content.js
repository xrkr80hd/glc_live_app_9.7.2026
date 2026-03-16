export const homePlaceholders = {
  welcomeMessage: "Welcome back",
  churchIdentityLine: "Stay connected with Liberty Church throughout the week.",
  dailyVerseText: "Let all that you do be done in love.",
  dailyVerseReference: "1 Corinthians 16:14",
  serviceTimePrimary: "Sundays at 10:00 AM",
  serviceTimeSecondary: "Youth Devotion at 9:20 AM",
  serviceLocation: "100 McKeithen Dr, Alexandria, LA",
};

export const announcementCards = [
  {
    id: "announcement-1",
    title: "Midweek prayer is gathering momentum",
    summary: "Come ready to pray together and stand in faith for families, healing, and fresh direction.",
    date: "Wednesday Evening",
    content:
      "Our church family is setting aside this midweek gathering for focused prayer. If you have a need, submit it in the member area so the prayer team can cover it.",
    ctaLabel: "Share a Prayer Need",
  },
  {
    id: "announcement-2",
    title: "Youth students are meeting before service",
    summary: "Students can join the Sunday youth devotion before the main worship service begins.",
    date: "Sunday at 9:20 AM",
    content:
      "Youth devotion starts before the main service and helps students connect, pray, and prepare their hearts for worship.",
    ctaLabel: "Open Youth",
  },
  {
    id: "announcement-3",
    title: "Need help finding the right next step?",
    summary: "Use the member app to stay close to sermons, prayer, giving, and church communication during beta testing.",
    date: "This Week",
    content:
      "We are using this beta build to make church life easier to navigate. If something feels off, send feedback from the More screen so we can tighten it up quickly.",
    ctaLabel: "Send Feedback",
  },
];

export const sermonCards = [
  {
    id: "sermon-latest-1",
    title: "The Presence of God Changes Everything",
    series: "Sunday Morning",
    date: "Latest Message",
    description: "Catch the most recent Liberty Church message from the Sunday worship gathering.",
  },
  {
    id: "sermon-latest-2",
    title: "Faith for the Next Step",
    series: "Encouragement",
    date: "Recent Teaching",
    description: "A practical message on trusting God with the next decision in front of you.",
  },
  {
    id: "sermon-featured-1",
    title: "Grace in the Middle of the Process",
    series: "Featured",
    date: "From the Archive",
    description: "Revisit a message centered on grace, growth, and staying rooted in Christ.",
  },
];

export const prayerWallCards = [
  {
    id: "prayer-approved-1",
    title: "Prayer Wall Request",
    request: "Please pray for strength, peace, and wisdom for a family walking through a hard season.",
    meta: "Approved for church-wide viewing",
  },
  {
    id: "prayer-approved-2",
    title: "Prayer Wall Request",
    request: "Pray for healing, renewed hope, and open doors as God leads this next chapter.",
    meta: "Posted after moderation review",
  },
  {
    id: "prayer-approved-3",
    title: "Prayer Wall Request",
    request: "Please keep our students and leaders in prayer as they grow in faith and unity.",
    meta: "Read-only member view",
  },
];

export const youthDevotionalPlaceholders = {
  title: "Stay rooted when life gets loud",
  reference: "Psalm 119:105",
  passage: "Your word is a lamp to my feet and a light to my path.",
  text: "When everything feels noisy, God still leads clearly. Start with Scripture, keep your heart open in prayer, and trust that steady obedience matters.",
};

export const youthEventPlaceholders = {
  title: "Youth Night",
  date: "This Sunday",
  time: "9:20 AM",
  location: "Liberty Church Youth Space",
  description: "Students gather for prayer, Scripture, and community before the main service.",
  cta: "See Youth Schedule",
};

export const profilePlaceholders = {
  name: "Liberty Church Member",
  email: "member@example.com",
};

export const directoryEntries = Array.from({ length: 3 }, (_, index) => ({
  id: `directory-${index + 1}`,
  name: ["Prayer Team Contact", "Welcome Team Lead", "Youth Ministry Contact"][index],
  email: ["care@golibertychurch.com", "hello@golibertychurch.com", "youth@golibertychurch.com"][index],
  phone: ["Available through the church office", "Available through the church office", "Available through the church office"][index],
  role: ["Care Team", "Guest Services", "Youth Ministry"][index],
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
  request: [
    "Please pray for healing and wisdom during an upcoming medical appointment.",
    "Pray for our family as we walk through a transition and need peace.",
    "Please pray for boldness, strength, and a fresh hunger for God.",
  ][index],
  submittedBy: ["Beta Member", "Church Guest", "Youth Parent"][index],
  destination: index === 0 ? "Prayer Wall (Church Can See After Approval)" : "Pastor + Prayer Team (Private)",
  submittedAt: ["Today", "Yesterday", "This Week"][index],
  anonymous: index === 1,
}));

export function findAnnouncementById(id) {
  return announcementCards.find((item) => item.id === id) || announcementCards[0];
}

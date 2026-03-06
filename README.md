# Go Liberty Church App

An all-in-one church app for Liberty Church members.

## Project Overview

This repository is being prepared for the **Go Liberty Church** web application. The goal is to provide members with a central hub for sermons, events, giving, community connection, and more.

> **Note:** This is the initial project scaffold. Content, branding, and full features will be added in future stages.

---

## Repository Structure

```
golibertychurch.app/
├── public/                  # Static assets served directly
│   └── assets/
│       ├── images/          # Public image assets (logos, backgrounds)
│       └── fonts/           # Web fonts
├── src/                     # Application source code
│   ├── components/          # Reusable UI components
│   ├── pages/               # Top-level page views
│   │   ├── home/            # Home / landing page
│   │   ├── about/           # About the church
│   │   ├── sermons/         # Sermons archive & player
│   │   ├── events/          # Upcoming events calendar
│   │   ├── give/            # Online giving
│   │   └── connect/         # Connect / community
│   ├── styles/              # Global styles and themes
│   ├── utils/               # Shared utility functions
│   ├── hooks/               # Custom React hooks (if applicable)
│   ├── context/             # Global state / context providers
│   └── api/                 # API integration layer
├── content/                 # Church content (uploads, media)
│   ├── sermons/             # Sermon audio/video/notes
│   ├── events/              # Event details and images
│   └── media/               # General media assets
├── docs/                    # Project documentation
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

---

## Getting Started

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies (once a package manager and framework are chosen).
3. Start the development server (commands to be added).

---

## Pages / Sections Planned

| Page | Description |
|------|-------------|
| Home | Welcome screen, service times, announcements |
| About | Church history, staff, beliefs, location |
| Sermons | Stream or download past sermons |
| Events | Calendar of upcoming church events |
| Give | Secure online giving portal |
| Connect | Small groups, volunteer sign-up, contact form |

---

## Contributing

Content uploads, branding assets, and feature work will be organized in dedicated branches. See `docs/CONTRIBUTING.md` for guidelines (coming soon).

---

## License

To be determined.


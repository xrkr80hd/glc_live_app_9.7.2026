# Role Dashboard Instructions

## Operating Behavior

- WEBSITE-FIRST is mandatory.
- This is a website-first church platform.
- Do not replace the website build with an app-only architecture.
- Do not destroy or overwrite existing public website structure.
- Do not convert the whole project into a standalone mobile app.
- Role dashboards must be added as protected authenticated sections inside the existing platform.
- Public website pages and branding structure must remain intact.
- Treat the uploaded dashboard anchor images as the visual source of truth.
- Treat the prompt block below as implementation guidance for future dashboard work.
- Keep everything inside one unified Liberty Church app.
- Do not create separate apps per role.
- Do not show square-bracket placeholder tokens in member-facing UI.
- Use starter content, fallback copy, or empty states until backend wiring is ready.
- Do not invent backend behavior that has not been requested.
- Reuse shared layout and navigation wherever possible.
- Use the youth theme only on youth-specific routes.
- Do not push changes unless the user explicitly says to push.
- When responding to this prompt, provide the requested route map and implementation plan before coding.
- Frontend UX must stay plain-language and non-technical for everyday church users.
- Default upload UX must use a clean file-upload card, not a raw URL field.
- URL/video fields are optional secondary inputs only when the feature truly needs them, such as YouTube curriculum video support.
- Member-facing and ministry-facing flows should prefer labels like "Upload Lesson Material," "Browse Files," "Last taught," "Up next," and "Mark as taught."
- Never surface backend field names like `file_url`, `module_key`, `curriculum_id`, or similar technical schema terms in the visible UI.
- Older or non-technical members must be able to understand what to do without training.
- Upload components must look polished, mobile-friendly, and visually intentional rather than like default admin forms.

```text
You are wiring the Liberty Church role dashboard system using the uploaded dashboard anchors already present in this workspace.

Use the filenames below as the source of truth for role dashboard structure and hierarchy.

ROLE DASHBOARD FILES
- 1. General Member.png
- 2. Worship Team Dashboard.png
- 3. Music Minister Dashboard.png
- 4. Media Team Dashboard.png
- 5. FOH Sound Dashboard.png
- 6. Youth Minister Dashboard Concept.png
- 6.1 Customize Youth Site Theme.png
- 6.2a Youth Minister Dashboard.png
- 6.2b Youth Site Live Preview.png
- 6.3 Youth Ministry Run of Show.png
- 6.4 Youth Minister Assistant Dashboard.png
- 7. Kids Ministry Dashboard.png
- 8. Pastor Dashboard.png
- 8.1 Bookkeeper Dashboard.png
- 9. SuperUser Dashboard.png

GOAL
Build the role-aware dashboard layer for the Liberty Church app.

This is ONE unified app.
Do NOT build separate apps for each role.
All roles share the same core platform and base member navigation.
Each role gets additional dashboard tools and screens based on permissions.

CORE SYSTEM RULES
- one shared Liberty Church app
- one shared design system
- one shared bottom navigation for standard member areas
- standard theme = white background + Liberty green accents
- youth ministry theme = dark youth variant only for youth-specific routes/screens
- do not render raw square-bracket placeholder tokens visibly in the final UI
- use app-ready starter content, bound data, fallback text, or clean empty states instead of visible mock placeholder syntax
- do not hard-code fake production data
- do not invent backend logic yet
- focus on screen wiring, role visibility, route structure, and dashboard access

BASE MEMBER EXPERIENCE
All authenticated roles inherit the standard member experience first.

Shared member screens:
- Home
- Live
- Sermons
- Prayer
- Prayer Wall
- Announcements
- Give
- Beliefs
- More
- Profile
- Settings
- Church Directory
- Edit Profile
- Change Password

ROLE DASHBOARD STRUCTURE

1. General Member
File:
- 1. General Member.png

Purpose:
Base dashboard / role view for normal members.

Behavior:
- no admin tools
- no publishing tools
- no moderation tools
- quick access to announcements, prayer wall, directory, settings, profile

2. Worship Team
File:
- 2. Worship Team Dashboard.png

Purpose:
Role dashboard for worship team members.

Tools include:
- My Service Plans
- Song Book
- Assigned Songs
- Rehearsal Notes

3. Music Minister
File:
- 3. Music Minister Dashboard.png

Purpose:
Expanded worship leadership dashboard.

Tools include:
- My Service Plans
- Song Book
- Scheduled Songs
- Manage Songs
- Rehearsal Notes
- Record Rehearsal
- Order Requests
- Announcement Publisher

Order Request capability:
- can submit order requests to Pastor
- can view status of their own requests

4. Media Team
File:
- 4. Media Team Dashboard.png

Purpose:
Production / media dashboard.

Tools include:
- Run of Show
- Media Prep
- Livestream Controls
- Production Tools
- Song Lyrics
- Sermon Slides
- Graphics

Order Request capability:
- media lead may submit order requests to Pastor
- can view status of their own requests

5. FOH Sound
File:
- 5. FOH Sound Dashboard.png

Purpose:
Sound engineer dashboard.

Tools include:
- Run of Show
- Sound Check
- Microphone Assignments
- Tech Docs
- Current Setlist

Order Request capability:
- FOH lead may submit order requests to Pastor
- can view status of their own requests

6. Youth Ministry module
Files:
- 6. Youth Minister Dashboard Concept.png
- 6.1 Customize Youth Site Theme.png
- 6.2a Youth Minister Dashboard.png
- 6.2b Youth Site Live Preview.png
- 6.3 Youth Ministry Run of Show.png
- 6.4 Youth Minister Assistant Dashboard.png

Purpose:
Youth ministry leadership and youth-facing site controls.

Important:
- 6. Youth Minister Dashboard Concept.png is an earlier concept reference only
- 6.2a Youth Minister Dashboard.png is the MAIN Youth Minister dashboard
- 6.2b Youth Site Live Preview.png is the PREVIEW screen showing what students see
- 6.3 Youth Ministry Run of Show.png is a sub-screen under Youth Minister tools
- 6.4 Youth Minister Assistant Dashboard.png is a separate role dashboard with fewer top-level controls

Youth role behavior:
- youth-specific screens use the dark youth theme
- youth operational screens remain clear and usable
- Youth Minister can access theme customization and live preview
- Youth Minister Assistant can publish youth content, but the Youth Minister is notified
- keep the youth module grouped together logically

Youth Minister order capability:
- can submit order requests to Pastor
- can view status of youth ministry requests

Youth Minister Assistant order capability:
- can submit order requests to Pastor
- can view status of youth ministry requests
- Youth Minister should be able to view requests submitted by the assistant

7. Kids Ministry
File:
- 7. Kids Ministry Dashboard.png

Purpose:
Kids ministry leadership dashboard.

Important:
Keep the same professional Liberty Church visual system.
Do NOT turn this into a cartoon app.

Tools include:
- Check-In
- Attendance
- Lesson Plan
- Activities
- Volunteer Assignments
- Safety / Incident Report
- Parent Messages
- Songs / Worship
- Kids Directory
- Emergency Contacts
- Parent Communication
- Announcements

Order Request capability:
- kids ministry leader can submit order requests to Pastor
- can view status of their own requests

8. Pastor
File:
- 8. Pastor Dashboard.png

Purpose:
Pastoral operations dashboard.

Tools include:
- Sermons
- Messages
- People
- Giving
- Prayer Requests
- Run of Show
- Reports
- Upcoming Events
- Church Directory
- Volunteer Scheduling
- Pastoral Care
- File Storage
- Prayer Wall
- Announcements
- Member Directory
- Volunteer Teams
- Order Requests Review
- Bookkeeper Reports

Pastor visibility:
- can review all submitted order requests from ministry heads
- can approve or deny order requests
- can view all Bookkeeper-submitted reports
- Pastor is the primary reviewer of Bookkeeper reporting

8.1 Bookkeeper
File:
- 8.1 Bookkeeper Dashboard.png

Purpose:
Financial reporting and giving oversight role for church bookkeeping.

Tools include:
- Giving Reports
- Tithe Summaries
- Fund Designation Reports
- Donation Reconciliation
- Weekly Report Builder
- Monthly Report Builder
- Export Reports
- Submit Report to Pastor

Permissions:
- can view and manage financial reporting tools
- can prepare and submit financial summaries to Pastor
- can review financial categories and reconciliations
- can access bookkeeping-specific reports only
- cannot assign roles
- cannot manage permissions
- cannot access youth ministry controls
- cannot publish sermons
- cannot manage global app settings unless separately assigned
- may optionally view order requests for budgeting/reporting visibility, but does not approve them unless explicitly granted

Pastor-only relationship:
- reports prepared by Bookkeeper are visible to Pastor
- Bookkeeper reports upward to Pastor
- this dashboard is not visible to normal members

9. SuperUser
File:
- 9. SuperUser Dashboard.png

Purpose:
Highest-level platform control dashboard.

Tools include:
- Users
- Roles
- Permissions
- Announcements
- Sermons
- Livestream
- Ministries
- Reports
- Team Access
- Scripture Library
- Upload Manager
- Bookkeeping Reports
- Worship Tools
- Kids Content
- Order Request Oversight

ROLE ACCESS MODEL
One user may have multiple roles.
Permissions are additive.
Dashboards and tools should render according to assigned roles.

Example:
- General Member only sees the base member dashboard
- Worship Team sees member experience + worship dashboard access
- Youth Minister sees member experience + youth ministry dashboard/tools
- Pastor sees member experience + pastoral dashboard/tools
- Bookkeeper sees member experience + bookkeeping dashboard/tools
- SuperUser sees all system-level controls

ORDER REQUEST SYSTEM
Create a shared ministry order request workflow.

Roles allowed to submit order requests:
- Music Minister
- Youth Minister
- Youth Minister Assistant
- Kids Ministry Leader
- Media Team Lead
- FOH Lead

Roles allowed to approve or deny:
- Pastor
- SuperUser

Bookkeeper visibility:
- Bookkeeper may optionally view submitted requests for budgeting/reporting visibility
- Bookkeeper does not approve unless explicitly granted

Order request statuses:
- Draft
- Submitted
- Under Review
- Approved
- Denied
- Ordered
- Completed

Each ministry dashboard should include an Order Requests tool only where appropriate for that role.
Pastor dashboard should include Order Request review access.
SuperUser dashboard should include full visibility.
Bookkeeper dashboard should include reporting visibility if configured.

ROUTING / STRUCTURE GOAL
Create a role dashboard routing plan and implementation structure that makes sense inside one app.

Suggested dashboard entry structure:
- /dashboard/member
- /dashboard/worship
- /dashboard/music-minister
- /dashboard/media
- /dashboard/foh
- /dashboard/youth
- /dashboard/youth/theme
- /dashboard/youth/preview
- /dashboard/youth/run-of-show
- /dashboard/youth/assistant
- /dashboard/kids
- /dashboard/pastor
- /dashboard/bookkeeper
- /dashboard/superuser

You may adjust route naming if needed, but keep them clean and logical.

WHAT TO BUILD
1. Audit the current app structure
2. Create a role dashboard map
3. Create a role visibility plan
4. Create or update the dashboard routes
5. Reuse shared layout/components where possible
6. Keep dashboards visually aligned with their uploaded anchors
7. Keep youth-specific pages grouped under youth module logic
8. Treat 6.2a as the final main Youth Minister dashboard
9. Treat 6.2b as the youth-facing preview screen
10. Treat 6.3 as a youth sub-tool screen, not a separate top-level role
11. Add Bookkeeper as a distinct pastoral/admin-adjacent dashboard role
12. Ensure visible UI uses clean starter copy instead of raw bracket placeholder tokens

WHEN YOU RESPOND
First give me:
- the cleaned role-to-route map
- the dashboard file/component plan
- what routes/pages/components you will create or update
- how you plan to handle shared layout vs role-specific layout
- how order request submission and Pastor review visibility will be structured
- how Bookkeeper reporting visibility to Pastor will be structured

Then proceed with implementation.
```

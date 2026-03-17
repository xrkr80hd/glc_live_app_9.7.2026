# Church Messenger MVP — Codex Build Handoff

## Objective
Stage and build a simple in-app messenger module that runs inside the existing church application.

This is **not** a full Slack or Discord clone.

The goal is a clean, stable MVP that supports:
- direct messages
- simple group chats
- unread indicators
- basic in-app notifications

Build it in phases so it can be tested early and expanded later.

---

## Product Intent
The church app already has user accounts.

This messenger should feel like a native feature of the church platform, not a separate app.

Keep the UX:
- simple
- warm
- uncluttered
- mobile-friendly
- role-aware where needed
- easy for non-technical church members

Do not overbuild phase 1.

---

## Phase 1 MVP Scope

### Include
- inbox screen
- conversation screen
- direct 1-to-1 messaging
- simple group messaging
- send text messages
- unread badge/count
- conversation list ordered by latest activity
- basic member search to start a conversation
- basic in-app notification record for new messages
- soft role-awareness if already available in app auth layer

### Do Not Include Yet
- voice messages
- video/audio calling
- file uploads
- image uploads
- reactions
- threading
- message editing
- message deleting for everyone
- typing indicators
- read receipts per message
- advanced moderation dashboard
- pinned messages
- search across message bodies
- push notifications unless already easy to plug in
- end-to-end encryption
- announcement channels unless nearly free to add

Keep it lean.

---

## Recommended UX Screens

### 1. Inbox Screen
Show:
- conversation name
- latest message preview
- timestamp of latest message
- unread badge
- avatar or initials
- button to start new message

Behavior:
- newest active conversations at top
- unread visually obvious
- empty state should be friendly and clean

### 2. Conversation Screen
Show:
- conversation title
- member names for direct or group chat
- scrollable message list
- composer at bottom
- send button
- timestamps in a simple readable way

Behavior:
- messages grouped cleanly
- current user messages visually distinct
- auto-scroll to newest on open
- support long conversations without becoming janky

### 3. New Message Screen
Show:
- searchable member list
- option to start direct conversation
- option to create simple group chat

Behavior:
- if direct conversation already exists, open existing one instead of duplicating

---

## Core Data Model

Use names that fit the existing codebase if needed, but the structure should roughly be this.

### conversations
Fields:
- id
- type (`direct`, `group`)
- title nullable
- created_by
- created_at
- updated_at
- last_message_at

### conversation_members
Fields:
- id
- conversation_id
- user_id
- joined_at
- last_read_at
- role nullable (`owner`, `member`) for future use

### messages
Fields:
- id
- conversation_id
- sender_id
- body
- created_at
- updated_at nullable
- deleted_at nullable

### notifications
If app already has a general notifications table, reuse it.
Otherwise:
- id
- user_id
- type
- title
- payload json
- created_at
- read_at nullable

---

## Rules / Logic

### Direct Messages
- a direct conversation must only have 2 members
- prevent duplicate direct threads between the same 2 users
- if a direct thread exists, reuse it

### Group Messages
- allow creator to choose multiple members
- group title optional for MVP
- default generated name can be member names if no title exists

### Unread State
- unread can be derived from `last_read_at` vs latest message timestamp
- do not overcomplicate this in phase 1
- badge count should be easy and reliable

### Notifications
On new message:
- create notification records for all members except sender
- do not spam duplicate notifications if user is actively viewing thread unless easy to detect

---

## API / Server Requirements

Build or expose endpoints/actions for:

### Conversations
- create direct conversation
- create group conversation
- list user conversations
- get conversation details
- get conversation messages

### Messages
- send message
- list messages for conversation
- mark conversation as read

### Search
- search members to start conversation

Keep API names clean and consistent with existing app patterns.

---

## Real-Time Strategy

If the app already has real-time support, use it.

If not, phase 1 can still work with:
- optimistic send
- polling or lightweight refresh
- refresh on screen focus
- refresh after send

If real-time is easy, support:
- new message events
- conversation list refresh
- unread badge refresh

Do not let lack of real-time block MVP launch.

---

## Front-End Requirements

### General
- mobile-first
- responsive
- visually consistent with existing church app
- soft, clean styling
- readable spacing
- no clutter
- no harsh “enterprise chat app” vibe

### Inbox UI
Each row should show:
- avatar/initials
- conversation name
- last message preview
- last activity time
- unread badge

### Conversation UI
- bubbles or clean stacked cards are fine
- current user aligned differently from others
- composer fixed near bottom
- handle long text cleanly
- preserve line breaks

### Empty States
Add thoughtful empty states:
- no conversations yet
- no messages yet
- no search results

Keep them friendly and church-appropriate, not cheesy.

---

## Security / Permissions

Use existing app auth.

At minimum:
- only authenticated users can access messenger
- only conversation members can read conversation messages
- only conversation members can send into that conversation
- server-side validation required for all conversation access
- never trust client-side membership checks alone

If roles already exist:
- keep code structured so future role-based messaging rules can be added cleanly

Do not hardwire weird assumptions that will make ministry-based permissions impossible later.

---

## Suggested Build Order

### Stage 1
Set up schema and server models:
- conversations
- conversation_members
- messages
- unread logic foundation

### Stage 2
Build inbox screen:
- list conversations
- show preview
- unread badge
- newest first

### Stage 3
Build direct messages:
- member search
- create/reuse direct conversation
- send and render text messages

### Stage 4
Build group chat:
- select multiple members
- create group thread
- basic title handling

### Stage 5
Add in-app notifications:
- create notification on new message
- update unread state
- mark as read on open

### Stage 6
Refine UX:
- loading states
- empty states
- error handling
- mobile polish
- performance cleanup

---

## Non-Negotiables
- keep this modular
- keep it clean
- avoid feature creep
- avoid duplicate direct threads
- do proper server-side auth checks
- do not make the UI visually noisy
- do not build a giant messaging platform in phase 1

---

## Nice Future Additions (Not Now)
These should be planned for future expansion, not included unless trivial:
- ministry channels
- staff-only channels
- announcement/broadcast channels
- prayer team private threads
- attachment uploads
- image sharing
- read receipts
- typing indicators
- reactions
- moderation/reporting tools
- archive/mute conversation
- push notifications
- pastoral care workflows
- parent-visible youth messaging rules

---

## Developer Notes
Build this as a standalone feature module inside the church app with clean separation between:
- UI components
- server actions / API
- database access
- unread/notification logic

Prefer maintainable boring code over clever wizard nonsense.

The MVP should ship as:
- simple
- stable
- understandable
- expandable

---

## Deliverable Expectation
Codex should:
1. stage the architecture
2. create schema/models
3. scaffold inbox, conversation, and new-message flows
4. implement direct and basic group chat
5. wire unread logic
6. leave clean extension points for future church-specific messaging features

Success means:
- users can message each other inside the app
- group chats work
- unread state works
- UI feels native to the church app
- codebase is ready for later expansion

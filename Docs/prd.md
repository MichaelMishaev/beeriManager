Product Requirements Document (PRD)
Project: Parent Committee Coordination App (PWA)
Date: September 2025
Prepared by: [Your Name]
1. Overview
The Parent Committee Coordination App is a mobile-first PWA that helps school parents manage events, tasks, responsibilities, issues, and protocols in one place.
The app integrates with a dedicated Google Calendar (two-way sync), provides a global searchable repository of documents and protocols, and enforces a simple edit control using one global password.
2. Objectives
Provide a single hub for all parent group activities.
Eliminate forgotten todos through Google Calendar reminders.
Assign clear responsibilities to people, beyond just tasks.
Allow protocols/history to be stored with direct links to external documents (Google Docs/Drive).
Keep the system simple, mobile-first, Hebrew-only, and easy to adopt.
Allow public viewing for transparency, with password-protected editing for authorized users.
3. Scope (MVP)
3.1 Core Features
Events
Title, description, date/time, optional location.
Two-way sync with dedicated Google Calendar.
Attendants added as free-text comments.
📌 **Recurring events support** (weekly/monthly/custom patterns).
📌 **Registration forms** - Create custom forms with configurable fields (name, phone, custom fields).
📌 **QR code generation** - Auto-generate QR codes for event registration URLs.
📌 **Registration management** - View all registrations under each event.
Tasks
One owner (creator).
Due date, optional URL attachments (Google Docs/Drive).
Can link to an event.
No dependencies.
📌 Responsibilities
Assign long-term or role-based responsibilities (not tied to due dates).
Each record has: person’s name + description (e.g., "דורית – אחראית על ארגון כיבוד").
Can optionally link to an event.
Separate Responsibilities screen + section on event detail.
Plain text only.
Issues
Simple list with status labels (To Do, In Progress, Blocked, Done).
Plain-text comments.
Optional link to event/task.

📌 Anonymous Feedback
Anonymous feedback form system.
Supports Hebrew, Russian, Arabic, and English.
Feedback items appear in admin dashboard.
No tracking of submitter identity.
Categorizable by topic (safety, events, suggestions, complaints).

📌 Expense Approval Workflow
Request → Review → Approve/Reject flow.
Attach receipts/quotes (Google Drive URLs).
Budget remaining indicator.
Chairman digital signature saved to Google Drive.
Expense history and approval audit trail.

📌 Meeting Agenda Builder
Collect topics throughout the month.
Auto-generate meeting agenda.
Time allocation per topic.
Link to relevant issues/tasks.
Post-meeting: Convert to minutes with decisions.

📌 Vendor/Supplier Database (Password Protected)
Contact info, services, pricing history.
Past event reviews and ratings.
Preferred vendor marking.
Contract/agreement links (Google Drive).
Search by service type.
Protocols / History
Entries with title, body (summary), categories, year.
Each protocol supports multiple external links (e.g., Google Docs/Drive).
Protocol list shows title + year, and each entry has one or more “🔗 קישור למסמך” links.
No versioning.
Filter by year, category, keyword search.
Search
Global search across events, tasks, issues, responsibilities, and protocols.
Access Control
View: public (no login).
Edit: one global password (hard-coded, env var).
📌 **Audit trail** - Track who edited what and when (editor name stored).
📌 **Version history** - Track all changes to events, tasks, responsibilities, protocols with ability to view previous versions.
Reminders & Notifications
Managed by Google Calendar.
Only Admin receives optional app/email notifications.
📌 **Push notifications** - PWA push for urgent updates (opt-in).
UI/UX
Mobile-first PWA.
Hebrew primary, with Russian support for feedback.
RTL for Hebrew/Arabic, LTR for Russian/English.
Deep links for events/tasks/issues/responsibilities/protocols.
Color palette: Sky Blue, Blue-Green, Prussian Blue, Selective Yellow, UT Orange.
📌 **Dashboard/home screen** with upcoming events, pending tasks, recent updates.
📌 **WhatsApp share buttons** for direct sharing (beyond just deep links).
📌 **Offline mode** - PWA works without internet, syncs when reconnected.
📌 **Bulk operations** - Select multiple items for status updates/exports.
Export & Backup
Manual CSV export per entity.
Created/updated timestamps stored.
Backups handled manually.
4. Out of Scope (v1)
Per-group dashboards/permissions.
Native apps (only PWA).
Analytics/statistics.
File uploads (URLs only).

📌 **Added to MVP (based on research):**
- **Custom registration forms** with QR codes for events
- **Anonymous feedback system** (Hebrew/Russian/Arabic/English)
- **Simple RSVP** for events (yes/no/maybe count)
- **Volunteer sign-ups** with slots/shifts
- **Payment collection** via payment links (PayBox/Bit)
- **Privacy consent tracking** (photo permissions, data usage)
- **Emergency contacts** per family
- **Financial tracking** - Basic income/expense log
- **Expense approval workflow** with Google Drive integration
- **Meeting agenda builder** with minutes tracking
- **Vendor database** (password protected)
5. Technical Requirements
5.1 Platform & Hosting
Frontend: Next.js (PWA).
Backend/DB: Supabase (Postgres).
Hosting: Vercel + Supabase.
Sync: Google Calendar API v3 (incremental sync).
5.2 Database Schema (main tables)
events → id, title, description, start/end, google_event_id, tags.
tasks → id, title, owner, due date, status, urls, event_id.
responsibilities → id, person_name, description, linked_event_id.
issues → id, title, description, status, linked_event_id, linked_task_id.
issue_comments → id, issue_id, author_name, body.
protocols → id, title, body, year, categories, urls[] (multiple links).
app_settings → google_calendar_id, editor_global_password_hash.
audit_log → id, user_name, action, entity_type, entity_id, timestamp, old_values, new_values.
family_info → id, family_name, emergency_contacts, photo_permission, consent_date.
volunteer_slots → id, event_id, slot_name, max_volunteers, volunteers[].
financial_records → id, type (income/expense), amount, description, date, payment_link.
event_registrations → id, event_id, form_fields[], registrant_data{}, created_at, qr_checked_in.
anonymous_feedback → id, category, message, language, created_at, status, admin_notes.
expense_requests → id, title, amount, description, requester, receipts[], status, approver, approval_date, drive_url.
meeting_agendas → id, date, topics[], minutes, decisions[], attendees[].
vendors → id, name, contact_info, services, pricing, rating, reviews[], contracts[], is_preferred.
5.3 Security
Edit access requires global password (bcrypt hash in env).
Public view requires no login.
No personal child data stored.
📌 **Privacy compliance** - GDPR-ready consent management.
📌 **Audit logging** - All edits tracked with editor identification.
6. Success Criteria
Parents can view events, tasks, responsibilities, issues, and protocols in one hub.
Calendar sync works both ways.
Responsibilities clearly displayed per event and globally.
Protocols have clickable document links (one or more per entry).
Admin can export data to CSV.
App works smoothly on mobile with RTL Hebrew layout.
7. Timeline (One Week MVP)
Day 1: Setup repo, DB schema, editor guard.
Day 2: CRUD for Events/Tasks/Responsibilities.
Day 3: Issues + comments. Event detail with linked tasks & responsibilities.
Day 4: Protocols with multiple links + global search + vendor database.
Day 5: Google Calendar sync + expense workflow + meeting agendas.
Day 6: Exports, Dashboard, UI polish (RTL, colors, Hebrew labels), offline mode.
Day 7: QA + deploy + onboarding walkthrough + push notifications setup.
8. Risks & Mitigations
Global password leaks → rotate env var quickly.
Google API errors → retry logic, error banner for admin.
Low adoption → use deep links in WhatsApp posts to encourage usage.
Privacy breach → minimal data collection, consent forms, auto-deletion policies.
Over-engineering → v1 is minimal; advanced features deferred.
✅ This PRD is now fully updated with protocols as linked documents (multiple links supported).
✅ **Updated with critical features** based on industry research:
   - Recurring events, offline PWA, dashboard view
   - WhatsApp share buttons, push notifications, bulk operations
   - RSVP tracking, volunteer sign-ups, payment collection
   - Privacy consent, emergency contacts, financial tracking
   - Audit trail for accountability
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Parent Committee Coordination App** - A Hebrew-only PWA for managing school parent committee activities, events, tasks, responsibilities, issues, and protocols.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS with RTL support
- **Database**: Supabase (PostgreSQL)
- **Calendar**: Google Calendar API v3 (two-way sync)
- **Hosting**: Railway (http://pipguru.club)
- **PWA**: next-pwa for offline support
- **Domain**: pipguru.club (configured via Railway)

## Commands (To be implemented)

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Database
npm run db:migrate   # Run Supabase migrations
npm run db:seed      # Seed initial data
npm run db:reset     # Reset database

# Testing
npm run test         # Run all tests
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
```

## Architecture

### Key Design Decisions
- **Mobile-first PWA**: Optimized for mobile devices with offline support
- **Hebrew RTL**: All UI elements and text direction right-to-left
- **Single password auth**: One global password for all editors (stored in env)
- **Public viewing**: No authentication required for viewing
- **Google Calendar sync**: Bidirectional sync with dedicated calendar

### Core Entities
1. **Events** - Calendar items with date/time, synced with Google Calendar
2. **Tasks** - Actionable items with owners and due dates
3. **Responsibilities** - Long-term role assignments
4. **Issues** - Problem tracking with status workflow
5. **Protocols** - Historical documents with external links
6. **Committees** - Committee management with members and responsibilities
7. **Feedback** - Anonymous parent feedback system
8. **Comments** - Attached to issues for discussion

### Database Schema
- Uses Supabase with PostgreSQL
- Main tables: events, tasks, responsibilities, issues, protocols, committees, anonymous_feedback, app_settings
- All timestamps tracked (created_at, updated_at)
- Google Calendar sync via google_event_id field
- Row Level Security (RLS) for public read, admin write access

### Security Model
- Public read access (no auth required)
- Edit access via global password (bcrypt hashed)
- No personal child data stored
- Environment variables for sensitive config

## Development Guidelines

1. **Hebrew-first**: All UI text in Hebrew, RTL layout throughout
2. **Mobile-first**: Design for mobile screens first, then tablet/desktop
3. **Deep linking**: Support shareable URLs for all entities
4. **Error handling**: User-friendly Hebrew error messages
5. **Performance**: Implement lazy loading, optimize for 3G connections
6. **Accessibility**: Ensure screen reader compatibility with Hebrew

## Color Palette
- Sky Blue: #87CEEB
- Blue-Green: #0D98BA
- Prussian Blue: #003153
- Selective Yellow: #FFBA00
- UT Orange: #FF8200

## Important Context

- Timeline: 7-day MVP development
- Users: School parent committee members
- Primary use: WhatsApp link sharing for coordination
- Critical features: Calendar sync, responsibilities tracking, protocol links
- while develop, always build automation tool in parallel using playwright tool
- for design use '/Users/michaelmishayev/Desktop/Projects/beeriManager/Docs/design'
- whe dev check if what you change can create egresion bugs in other places.
- when i ask to push, push to git to connected repository but do not push files that should not be in git, like temp files etc
- all code must follow strict typescript
- always develop strict typescript
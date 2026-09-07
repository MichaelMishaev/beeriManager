# Google Analytics Tracking Implementation Guide

## Overview

This document describes the comprehensive Google Analytics tracking system implemented across BeeriManager to monitor user and admin behavior.

## What Was Implemented

### 1. Core Analytics Library (`src/lib/analytics.ts`)

A type-safe analytics utility with the following features:

#### Event Categories
- **NAVIGATION** - Page and route navigation
- **TASK** - Task management actions
- **EVENT** - Event creation/editing
- **MEETING** - Meeting management
- **VENDOR** - Vendor management
- **FEEDBACK** - Feedback submissions
- **TICKET** - Ticket system
- **ADMIN_*** - Admin-specific actions (task, event, meeting, vendor, settings, highlights)
- **AI_ASSISTANT** - AI assistant interactions
- **PWA** - PWA installation events
- **AUTH** - Authentication events
- **ERROR** - Error tracking

#### Event Actions
- **CRUD Operations**: CREATE, READ, UPDATE, DELETE
- **User Interactions**: CLICK, SUBMIT, CANCEL, OPEN, CLOSE, SEARCH, FILTER, SORT, EXPORT, IMPORT
- **Navigation**: NAVIGATE, BACK
- **AI Actions**: AI_CHAT_OPEN, AI_CHAT_SEND, AI_SUGGESTION_ACCEPT, AI_SUGGESTION_REJECT
- **Auth**: LOGIN, LOGOUT
- **Errors**: ERROR_OCCURRED

#### User Types
- **ADMIN** - Admin users (with auth token on /admin routes)
- **USER** - Regular users (with auth token)
- **ANONYMOUS** - Users without auth token

### 2. Tracking Functions

#### Primary Functions

```typescript
// Track any event
trackEvent({
  category: EventCategory.ADMIN_TASK,
  action: EventAction.CREATE,
  label: 'New task created',
  userType: UserType.ADMIN,
  componentName: 'TaskForm',
  entityId: '123',
  entityType: 'task',
  metadata: { customField: 'value' }
})

// Track page views
trackPageView('/admin/highlights', 'Admin Highlights Management', UserType.ADMIN)

// Track errors
trackError(new Error('Something failed'), true, 'ComponentName')

// Track timing/performance
trackTiming('api_call', 1234, 'api', 'fetch_tasks')
```

#### Convenience Functions

```typescript
// Track admin actions
trackAdminAction(EventAction.CREATE, 'Created new highlight', 'AdminHighlightsPage', { id: '123' })

// Track user actions
trackUserAction(EventCategory.TASK, EventAction.UPDATE, 'Updated task', 'TaskCard', { id: '456' })

// Track AI interactions
trackAIInteraction('chat_open', 'User opened AI chat', { phase: 'initial' })

// Track navigation
trackNavigation('/admin/tasks', '/admin', 'Navigation')
```

### 3. Components with Tracking

#### Admin Components

##### **AdminHighlightsPage** (`/admin/highlights`)
Tracks:
- Page view on mount
- Add new highlight button click
- Highlight creation (success/error)
- Highlight update (success/error)
- Highlight deletion (initiated/confirmed/cancelled/success/error)
- Russian translation (click/success/error)

Events tracked:
- `admin_task_page_view` - Page loaded
- `admin_task_click` - Add/Edit/Delete button clicked
- `admin_task_create` - Create initiated
- `admin_task_create_success` - Highlight created
- `admin_task_create_error` - Creation failed
- `admin_task_update` - Update initiated
- `admin_task_update_success` - Highlight updated
- `admin_task_update_error` - Update failed
- `admin_task_delete` - Delete initiated
- `admin_task_delete_success` - Highlight deleted
- `admin_task_delete_error` - Deletion failed
- `admin_task_delete_cancelled` - User cancelled deletion
- `admin_task_delete_temp` - Temporary highlight removed
- `admin_task_translate_success` - Translation succeeded
- `admin_task_translate_error` - Translation failed

##### **AdminSectionListItem** (Dashboard Navigation)
Tracks:
- Navigation clicks to admin sections (both desktop and mobile)

Events tracked:
- `navigation_navigate` - User navigated to admin section
  - Includes: `to` (destination), `from` (origin), component name

#### AI Assistant Components

##### **AIChatModal**
Tracks:
- Modal open
- Message send
- Extraction success/failure
- Rate limiting
- Conversation phases

Events tracked:
- `ai_assistant_ai_chat_open` - Modal opened
- `ai_assistant_ai_chat_send` - Message sent
  - Metadata: messageLength, phase
- `ai_assistant_extraction_success` - Data extracted successfully
  - Metadata: dataType, gptCallCount
- `ai_assistant_extraction_failed` - Extraction failed
  - Metadata: failureType, failureCount, error

##### **AIConfirmationPreview**
Tracks:
- Suggestion acceptance
- Suggestion rejection
- Save success/failure

Events tracked:
- `ai_assistant_ai_suggestion_accept` - User accepted AI suggestion
  - Metadata: dataType
- `ai_assistant_ai_suggestion_reject` - User rejected AI suggestion
  - Metadata: dataType
- `ai_assistant_insert_success` - Suggestion saved successfully
  - Metadata: dataType
- `ai_assistant_insert_error` - Save failed
  - Metadata: dataType, error

## Event Naming Convention

Events are named using the pattern: `{category}_{action}`

Examples:
- `admin_task_create` - Admin creating a task
- `ai_assistant_chat_open` - AI chat opened
- `navigation_navigate` - Navigation event
- `error_error_occurred` - Error occurred

## Metadata Structure

All events include standard metadata:
```typescript
{
  event_category: string,      // Event category
  event_label?: string,         // Human-readable label
  value?: number,               // Numeric value
  user_type?: string,           // admin | user | anonymous
  component_name?: string,      // React component name
  page_url?: string,            // Current page URL
  entity_id?: string | number,  // Entity ID (task ID, event ID, etc.)
  entity_type?: string,         // Entity type (task, event, etc.)
  ...metadata                   // Custom metadata
}
```

## User Type Detection

The system automatically detects user type based on:
1. Presence of `auth-token` cookie
2. Current route (e.g., `/admin/*`)

Logic:
- Has auth token + on admin route = **ADMIN**
- Has auth token + not on admin route = **USER**
- No auth token = **ANONYMOUS**

## Viewing Analytics Data

### Google Analytics Dashboard

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (BeeriManager - G-9RS38VPXEZ)
3. Navigate to **Reports** → **Engagement** → **Events**

### Custom Reports

#### Admin Activity Report
Filter events by:
- `user_type = admin`
- Categories starting with `admin_`

Metrics to track:
- Admin actions per day
- Most used admin features
- Error rates

#### AI Assistant Usage
Filter events by:
- `event_category = ai_assistant`

Metrics to track:
- Chat opens
- Messages sent
- Extraction success rate
- Acceptance rate (accepts / (accepts + rejects))

#### Navigation Patterns
Filter events by:
- `event_category = navigation`

Metrics to track:
- Most visited pages
- User flow
- Bounce rates

### Real-time Monitoring

For live tracking:
1. Go to **Reports** → **Realtime**
2. See events as they happen
3. Monitor active users

## Testing the Implementation

### Development Mode

In development, all events are logged to console:
```
[Analytics] Event sent: admin_task_create {
  event_category: "admin_task",
  event_label: "Create new highlight",
  user_type: "admin",
  component_name: "AdminHighlightsPage",
  type: "achievement"
}
```

### Production Testing

1. **Open Browser Console** (F12)
2. **Perform actions** (click buttons, navigate, use AI assistant)
3. **Check Network Tab** for requests to:
   - `www.google-analytics.com/g/collect`
   - `www.googletagmanager.com`

### Example Test Scenarios

#### Test Admin Highlights Tracking
1. Navigate to `/admin/highlights`
   - Should track: `page_view`
2. Click "Add Highlight"
   - Should track: `admin_task_click`
3. Fill form and save
   - Should track: `admin_task_create`
   - On success: `admin_task_create_success`
4. Edit a highlight
   - Should track: `admin_task_update`
5. Delete a highlight
   - Should track: `admin_task_delete`, `admin_task_delete_success`

#### Test AI Assistant Tracking
1. Open AI chat
   - Should track: `ai_assistant_ai_chat_open`
2. Send a message
   - Should track: `ai_assistant_ai_chat_send`
3. AI extracts data
   - Should track: `ai_assistant_extraction_success`
4. Accept suggestion
   - Should track: `ai_assistant_ai_suggestion_accept`, `ai_assistant_insert_success`
5. Reject suggestion
   - Should track: `ai_assistant_ai_suggestion_reject`

#### Test Navigation Tracking
1. Click any admin section link
   - Should track: `navigation_navigate` with `to` and `from` metadata

## Performance Considerations

### Event Size
- Events are lightweight (< 1KB each)
- Minimal performance impact
- Batched by Google Analytics

### Privacy
- No personal information tracked
- No child data stored
- Anonymous user IDs only
- GDPR compliant

## Development Mode

In development (`NODE_ENV=development`):
- All events logged to console
- Easy debugging
- No production impact

Example console output:
```javascript
[Analytics] Event tracked: {
  category: 'admin_task',
  action: 'create',
  label: 'Create new highlight',
  userType: 'admin',
  componentName: 'AdminHighlightsPage'
}
```

## Next Steps

### Add Tracking to User Components

Similar patterns can be added to:
- Task components (`TaskCard`, `TaskForm`, `TaskList`)
- Event components (`EventCard`, `EventForm`)
- Meeting components
- Vendor components
- Feedback forms
- Ticket system

### Example for TaskCard:
```typescript
import { trackUserAction, EventCategory, EventAction } from '@/lib/analytics'

function TaskCard({ task }) {
  const handleComplete = () => {
    trackUserAction(
      EventCategory.TASK,
      EventAction.UPDATE,
      'Mark task as complete',
      'TaskCard',
      { taskId: task.id, completed: true }
    )
    // ... rest of logic
  }
}
```

### Custom Conversions

Set up conversion goals in GA:
1. AI Assistant successful extractions
2. Admin creating highlights
3. User completing tasks
4. PWA installations

### Funnel Analysis

Track user journeys:
1. AI Chat Open → Message Send → Extraction → Accept → Insert Success
2. Admin Login → Navigate to Highlights → Create → Success

## Troubleshooting

### Events Not Showing in GA

**Possible causes:**
1. Ad blocker enabled
2. GA tracking ID incorrect
3. Browser privacy settings
4. GA account not configured

**Solutions:**
1. Test in incognito mode
2. Check network tab for GA requests
3. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var
4. Wait 24-48 hours for data to appear

### Events Not Logged in Console

**Check:**
1. `NODE_ENV=development` set
2. Console log level (show "log" messages)
3. Browser console not filtered

### Duplicate Events

**Causes:**
- React strict mode (dev only)
- Multiple component mounts
- Event handler called multiple times

**Solutions:**
- Debounce event handlers
- Use `useEffect` with proper dependencies
- Check for duplicate tracking calls

## Summary

✅ **Implemented**:
- Core analytics library with type safety
- Admin highlights tracking (create, update, delete, translate)
- AI assistant tracking (chat, extraction, acceptance)
- Navigation tracking (admin dashboard)
- Page view tracking
- Error tracking
- User type detection

🔄 **Recommended Next Steps**:
- Add tracking to remaining user components
- Set up custom GA conversions
- Create dashboards for key metrics
- Monitor and analyze user behavior

📊 **Metrics Available**:
- Admin activity by type
- AI assistant usage and success rate
- Navigation patterns
- Error rates by component
- User engagement metrics

## References

- Google Analytics: https://analytics.google.com/
- GA4 Event Reference: https://developers.google.com/analytics/devguides/collection/ga4/events
- BeeriManager GA ID: **G-9RS38VPXEZ**

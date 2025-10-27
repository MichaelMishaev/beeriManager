# QA Checklist: Task Mention Popover Feature

## Test Date: $(date +%Y-%m-%d)
## Feature: Interactive Task Mentions in Protocol View

### Pre-Test Setup
- [ ] Server is running (`npm run dev` or production)
- [ ] Database migration for `completion_comment` is applied
- [ ] User is logged in as admin
- [ ] Test protocol with task mentions exists

---

## Core Functionality Tests

### 1. Protocol Detail Page Load
- [ ] Protocol detail page loads without errors
- [ ] All sections display correctly (Basic Info, Attendees, Agenda, Decisions, Action Items)
- [ ] Page layout is not broken
- [ ] No console errors in browser dev tools

### 2. Task Mention Display
- [ ] Task mentions appear as badges in Agenda section
- [ ] Task mentions appear as badges in Decisions section
- [ ] Task mentions appear as badges in Action Items section
- [ ] Badges have correct styling (secondary variant, with icon)
- [ ] Badge shows task title correctly
- [ ] Badge has hover effect

### 3. Task Popover Interaction
- [ ] Clicking on task badge opens popover
- [ ] Popover appears above/below badge (smart positioning)
- [ ] Popover shows loading state while fetching
- [ ] Popover displays task details:
  - [ ] Task title
  - [ ] Status badge with icon
  - [ ] Priority badge with color
  - [ ] Owner name
  - [ ] Due date (if exists)
  - [ ] Description (if exists)
  - [ ] Completion comment (if task is completed/cancelled and has comment)
- [ ] Clicking outside popover closes it
- [ ] Clicking same badge again closes popover
- [ ] ESC key closes popover

### 4. Multiple Task Mentions
- [ ] Multiple task mentions in same text work correctly
- [ ] Can open popover for different tasks
- [ ] Each badge fetches its own task data
- [ ] Popovers don't interfere with each other

### 5. Error Handling
- [ ] If task doesn't exist, popover shows error message
- [ ] If API fails, popover shows error message
- [ ] Error messages are in Hebrew
- [ ] Error doesn't break the page

### 6. Edge Cases
- [ ] Task with no due date displays correctly
- [ ] Task with no description displays correctly
- [ ] Completed task with completion comment shows comment
- [ ] Completed task without completion comment works fine
- [ ] Very long task title in badge doesn't break layout
- [ ] Very long description in popover is scrollable/readable

---

## Regression Tests

### 7. Protocol Edit Functionality
- [ ] Edit protocol button still works
- [ ] Delete protocol button still works
- [ ] Share protocol button still works
- [ ] TaskDrawer ("צפה במשימות") still works
- [ ] Task mentions in edit mode work correctly

### 8. TaskDrawer Functionality (Protocol Screen)
- [ ] Opening TaskDrawer from protocol page works
- [ ] Filter "Hide Completed" works
- [ ] Sort dropdown works
- [ ] Search works
- [ ] Marking task as complete with comment works
- [ ] Task list displays correctly

### 9. Other Protocol Features
- [ ] Attendees list displays correctly
- [ ] Category badge displays correctly
- [ ] Protocol date displays correctly
- [ ] External links still work
- [ ] Navigation buttons work

### 10. Task Detail Page
- [ ] Navigating to task detail page from task ID still works
- [ ] Task detail page shows completion comment
- [ ] Task actions still work

---

## Performance Tests

### 11. Loading Performance
- [ ] Page loads in reasonable time
- [ ] Popover opens quickly (< 500ms)
- [ ] No memory leaks when opening/closing popover multiple times
- [ ] Browser doesn't freeze or lag

---

## Mobile/Responsive Tests

### 12. Mobile View
- [ ] Task badges are tappable on mobile
- [ ] Popover is readable on mobile screen
- [ ] Popover doesn't overflow screen
- [ ] Popover closes when tapping outside on mobile

---

## Accessibility Tests

### 13. Keyboard Navigation
- [ ] Can tab to task badges
- [ ] Can open popover with Enter/Space
- [ ] Can close popover with ESC
- [ ] Focus management is correct

### 14. Screen Reader
- [ ] Task badges have appropriate labels
- [ ] Popover content is accessible
- [ ] Status and priority are announced correctly

---

## Browser Compatibility

### 15. Cross-Browser Testing
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Mobile Safari
- [ ] Works in Mobile Chrome

---

## Final Checks

### 16. Code Quality
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] Build succeeds
- [ ] No unused imports
- [ ] Code follows project conventions

### 17. Documentation
- [ ] Component has proper JSDoc comments
- [ ] Props are properly typed
- [ ] README/docs are updated if needed

---

## Issues Found

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
|         |             |          |        |

---

## Sign-off

- [ ] All critical tests passed
- [ ] No regressions detected
- [ ] Ready for deployment

**Tested by:** _________________
**Date:** _________________
**Notes:** _________________

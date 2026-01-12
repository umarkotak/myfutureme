# Refactor Dashboard Layout

## Summary

Refactor `pages/dashboard.js` to extract layout logic into a reusable `DashboardLayout` component and completely revamp `JobLogForm` into a Slack-like chat message list with infinite scroll.

## Problem

1. The dashboard page currently contains header and layout logic inline, making it harder to reuse across future pages.
2. The `JobLogForm` component is designed as a traditional form but should behave like a chat message stream:
   - Display logs from top (oldest) to bottom (newest)
   - Auto-scroll to the bottom on page load
   - Infinite scroll upward to load older logs
   - Input controls at the bottom (text, datetime, add button)
   - Auto-save edits after 1 second of inactivity

## Proposed Solution

### 1. Extract DashboardLayout Component

- Create `components/layouts/DashboardLayout.js`
- Move header, activity bar, and main container logic from `dashboard.js`
- Accept `children` prop for content area

### 2. Revamp JobLogForm → JobLogList

- Rename component to `JobLogList.js` for clarity
- Use reverse-chronological display (newest at bottom)
- Implement viewport detection for infinite scroll loading older logs
- Add input bar at the bottom with:
  - Text input field
  - Datetime picker
  - "Add Log" button
- Implement debounced auto-save (1 second delay) for inline editing

### 3. Add react-toastify

- Install `react-toastify` package
- Configure `ToastContainer` in `_app.js`
- Replace `alert()` calls with toast notifications

## Dependencies

- `react-toastify` - for toast notifications (new dependency)

## Out of Scope

- Mobile responsiveness changes (will use existing responsive patterns)
- Changes to other dashboard sections (work logs, application details)

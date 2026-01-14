# Design: Revamp Worklog Monthly Layout

## Component Structure

```
WorkLogPanel
├── Scrollable Container (flex-1, overflow-y-auto)
│   └── For each month group:
│       ├── MonthHeader (sticky, z-10)
│       │   ├── Month/Year Label
│       │   └── Action Buttons
│       └── Log Entries
│           └── ChatBubble
│               ├── Content (markdown)
│               └── Timestamp (inside bubble)
└── Input Bar (fixed at bottom)
```

## Key Implementation Details

### Monthly Grouping Logic

```javascript
// New helper function
function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Group detection in render
const prevLog = index > 0 ? sortedLogs[index - 1] : null;
const showMonthHeader =
  !prevLog || formatMonthYear(log.date) !== formatMonthYear(prevLog.date);
```

### Sticky Header CSS

```css
.month-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--background);
  backdrop-filter: blur(8px);
}
```

### Chat Bubble with Timestamp

Before (current):

```jsx
<div className="flex items-baseline gap-2 mb-1">
  <span className="font-semibold text-sm">Work Log</span>
  <span className="text-xs text-muted-foreground">{formatDisplayDate(log.date)}</span>
</div>
<div className="bg-card border...">
  {content}
</div>
```

After (proposed):

```jsx
<div className="bg-card border rounded-lg p-3">
  {content}
  <div className="text-xs text-muted-foreground mt-2 text-right">
    {formatBubbleDate(log.date)}
  </div>
</div>
```

### Header Buttons

Initial set of action buttons for the sticky month header:

- **Collapse/Expand**: Toggle visibility of logs in this month
- **More options**: Dropdown for additional actions (future extensibility)

## Visual Mockup

```
┌─────────────────────────────────────────────┐
│ 📅 January 2026              [▼] [•••]     │ ← Sticky header
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Worked on feature X implementation  │   │
│  │ - Added new component               │   │
│  │ - Fixed bug in API call             │   │
│  │                         Jan 12, Mon │   │ ← Timestamp in bubble
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Reviewed PRs and documentation      │   │
│  │                         Jan 11, Sun │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│ 📅 December 2025             [▼] [•••]     │ ← Next month header
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ End of year review completed        │   │
│  │                         Dec 31, Tue │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Considerations

- **Performance**: Sticky headers with many months should perform well since CSS handles it natively
- **Accessibility**: Ensure proper heading semantics for month headers
- **Mobile**: Sticky headers work well on mobile; no special handling needed

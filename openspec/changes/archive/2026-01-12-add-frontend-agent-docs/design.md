# Design: VS Code-like Dashboard UI

## Context

The user needs a compact, efficient interface to manage job applications and work logs. The design should be inspired by VS Code's UI patterns: sidebar navigation, panel-based layout, and keyboard-friendly interactions.

## Goals

- Create a familiar, efficient interface inspired by VS Code
- Compact layout that maximizes content visibility
- Easy navigation between job applications and work logs
- Tree view for hierarchical data (applications → logs)
- Dark/light theme support using existing next-themes

## Non-Goals

- Full VS Code feature parity (extensions, command palette complexity)
- Drag-and-drop panel rearrangement
- Custom keyboard shortcut configuration

## UI Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo | WorkNote                         [User] [⚙️] │
├────┬────────────────────────────────────────────────────────┤
│    │ ┌────────────────────────────────────────────────────┐ │
│ 📋 │ │ Job Applications                          [+ New]  │ │
│    │ ├────────────────────────────────────────────────────┤ │
│ 📝 │ │ 🔍 Search...                     [Filter: All ▾]   │ │
│    │ ├────────────────────────────────────────────────────┤ │
│    │ │ ▼ Acme Inc - Software Engineer         [applied]   │ │
│    │ │   ├ 📞 Phone Screen (Jan 5)                        │ │
│    │ │   └ 💬 Technical Interview (Jan 10)                │ │
│    │ │ ▶ TechCorp - Frontend Dev              [todo]      │ │
│    │ │ ▶ StartupXYZ - Full Stack              [in-progress]│ │
│    │ ├────────────────────────────────────────────────────┤ │
│    │ │          [Detail Panel - Selected Item]            │ │
│    │ │  Company: Acme Inc                                 │ │
│    │ │  Title: Software Engineer                          │ │
│    │ │  Status: applied  |  Salary: $100k-$150k           │ │
│    │ │  URL: https://...                                  │ │
│    │ │  Notes: Referred by John                           │ │
│    │ │                                    [Edit] [Delete] │ │
│    │ └────────────────────────────────────────────────────┘ │
└────┴────────────────────────────────────────────────────────┘
```

## Components

### ActivityBar (Left Sidebar)

- Icon-based navigation (like VS Code's activity bar)
- Icons: 📋 Job Applications, 📝 Work Logs
- Compact 48px width
- Highlights active section

### MainPanel

- Takes remaining width
- Contains list view + detail view (resizable split)

### TreeView

- Collapsible job applications with nested logs
- Status badges with color coding:
  - `todo`: gray
  - `applied`: blue
  - `in-progress`: yellow
  - `rejected`: red
  - `accepted`: green
  - `dropped`: muted

### DetailPanel

- Shows selected item details
- Inline editing capability
- Action buttons (Edit, Delete, Add Log)

### WorkLogPanel

- Calendar-style date picker or simple date list
- Markdown-friendly text area for content
- Auto-save on blur

## Decisions

1. **Split View vs Tabs**: Use split view (list + detail) for efficiency - no need to switch tabs
2. **Tree Structure**: Job applications with nested logs provides clear hierarchy
3. **Inline Actions**: Edit/delete buttons in detail panel, not context menus (simpler)
4. **Responsive**: On mobile, sidebar collapses to bottom tabs, panels stack vertically

## Risks / Trade-offs

- **Risk**: Complex UI may take longer to implement
  - **Mitigation**: Start with basic layout, enhance iteratively
- **Trade-off**: VS Code familiarity vs unique branding
  - **Decision**: Adopt patterns but keep WorkNote's color scheme

## Open Questions

- None at this time
